import { Platform, Platforms, Product } from './types';

interface GeneratePostsResponse {
  posts: Array<{
    platform: Platform;
    content: string;
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Sleep helper
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Check if error is retryable
function isRetryableError(status: number): boolean {
  // Server errors and some client errors are retryable
  return status >= 500 || status === 429 || status === 408;
}

// Calculate delay with exponential backoff
function calculateDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(1.5, attempt), 10000);
}

export async function generatePosts(
  product: Product,
  platforms: Platforms,
): Promise<GeneratePostsResponse> {
  const maxAttempts = 3;
  let lastError: Error | null = null;

  console.log('Starting API request:', {
    productName: product.name,
    platforms: Object.keys(platforms),
    apiUrl: API_URL,
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`API attempt ${attempt}/${maxAttempts}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const startTime = Date.now();
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product, platforms }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      console.log(`API request completed (attempt ${attempt}):`, {
        status: response.status,
        duration: `${duration}ms`,
        ok: response.ok,
      });

      let data: any;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        console.error(`API error (status ${response.status}):`, data);

        // Handle specific error cases
        if (response.status === 422) {
          // Validation errors - not retryable
          const errorMessage = data.details
            ? `Validation error: ${data.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')}`
            : data.message || 'Invalid input data';
          throw new Error(errorMessage);
        }

        if (response.status === 401) {
          throw new Error(
            'API key invalid. Please check server configuration.',
          );
        }

        if (response.status === 403) {
          throw new Error(
            'API access forbidden. Please check server configuration.',
          );
        }

        // For retryable errors, continue to retry logic
        if (isRetryableError(response.status)) {
          const errorMessage =
            data.message || `Server error (${response.status})`;
          lastError = new Error(errorMessage);

          if (attempt === maxAttempts) {
            throw new Error(
              `${errorMessage} - Failed after ${maxAttempts} attempts`,
            );
          }

          const delay = calculateDelay(attempt);
          console.log(
            `Retryable error (${response.status}), retrying in ${delay}ms...`,
          );
          await sleep(delay);
          continue;
        }

        // Non-retryable client error
        throw new Error(
          data.message || `Request failed with status ${response.status}`,
        );
      }

      // Validate response structure
      if (!data.posts || !Array.isArray(data.posts)) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure from server');
      }

      console.log(`API request successful on attempt ${attempt}:`, {
        postsReceived: data.posts.length,
        platforms: data.posts.map((p: any) => p.platform),
      });

      return data as GeneratePostsResponse;
    } catch (error) {
      lastError = error as Error;

      // Handle fetch-specific errors (network, timeout, etc.)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`Request timeout (attempt ${attempt})`);
          lastError = new Error('Request timed out. Please try again.');
        } else if (error.message.includes('fetch')) {
          console.error(`Network error (attempt ${attempt}):`, error.message);
          lastError = new Error('Network error. Please check your connection.');
        }
      }

      // If this was a non-retryable error or final attempt, throw
      if (
        attempt === maxAttempts ||
        (error instanceof Error &&
          (error.message.includes('Validation error') ||
            error.message.includes('API key invalid') ||
            error.message.includes('API access forbidden') ||
            error.message.includes('Invalid response')))
      ) {
        console.error(`Final error on attempt ${attempt}:`, lastError);
        throw lastError;
      }

      // Retry for network errors
      const delay = calculateDelay(attempt);
      console.log(`Network error, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // This shouldn't be reached, but just in case
  throw lastError || new Error('Request failed after multiple attempts');
}
