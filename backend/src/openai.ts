import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { AnyZodObject } from 'zod';
import { config } from './config';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    console.log('Initializing OpenAI client with config:', {
      model: config.generation.model,
      timeout: config.api.timeout,
      maxRetries: 0, // We handle retries manually
    });

    client = new OpenAI({
      apiKey,
      timeout: config.api.timeout,
      maxRetries: 0, // We'll handle retries manually
    });
  }

  return client;
}

// Helper to determine if an error is retryable
function isRetryableError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    // Rate limits - always retryable with backoff
    if (error.status === 429) return true;

    // Server errors - retryable
    if (error.status >= 500) return true;

    // Client errors - not retryable
    if (error.status >= 400 && error.status < 500) return false;
  }

  // Network errors, timeouts - retryable
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnreset') ||
      message.includes('enotfound')
    ) {
      return true;
    }
  }

  // Unknown errors - retryable with caution
  return true;
}

// Calculate delay with exponential backoff
function calculateDelay(attempt: number, isRateLimit: boolean = false): number {
  if (isRateLimit) {
    // For rate limits, use longer delays
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  }

  // For other errors, shorter delays
  return Math.min(1000 * Math.pow(1.5, attempt), 10000);
}

// Sleep helper
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param format first item is the format and the second one is the name for the format
 */
export async function callOpenAI(
  prompt: string,
  instructions: string,
  format: [AnyZodObject, string],
): Promise<string> {
  const openai = getClient();
  let lastError: Error | null = null;
  const maxAttempts = config.api.retries + 1;

  console.log('Starting OpenAI request:', {
    maxAttempts,
    model: config.generation.model,
    temperature: config.generation.temperature,
    maxTokens: config.generation.maxTokens,
    promptLength: prompt.length,
    instructionsLength: instructions.length,
    formatName: format[1],
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`OpenAI attempt ${attempt}/${maxAttempts}`);

      const startTime = Date.now();
      const response = await openai.responses.create({
        model: config.generation.model,
        temperature: config.generation.temperature,
        max_output_tokens: config.generation.maxTokens,
        input: prompt,
        instructions,
        text: {
          format: zodTextFormat(format[0], format[1]),
        },
      });
      const duration = Date.now() - startTime;

      if (!response.output_text) {
        console.error('Empty response from OpenAI:', { response });
        throw new Error('Empty response from OpenAI');
      }

      console.log(`OpenAI request succeeded on attempt ${attempt}:`, {
        duration: `${duration}ms`,
        tokensUsed: response.usage?.total_tokens || 'unknown',
      });

      return response.output_text;
    } catch (error) {
      lastError = error as Error;

      if (error instanceof OpenAI.APIError) {
        console.error(`OpenAI API Error (attempt ${attempt}/${maxAttempts}):`, {
          status: error.status,
          message: error.message,
          code: error.code,
          type: error.type,
          requestId: error.headers?.['x-request-id'],
        });

        // Handle specific error types
        if (error.status === 401) {
          console.error('Authentication failed - invalid API key');
          throw new Error('Invalid API key. Please check your OpenAI API key.');
        }

        if (error.status === 403) {
          console.error('API access forbidden - check account status');
          throw new Error(
            'API access forbidden. Please check your OpenAI account status.',
          );
        }

        if (error.status === 400) {
          console.error('Bad request error:', {
            message: error.message,
            prompt: prompt.substring(0, 200) + '...',
            instructions: instructions.substring(0, 200) + '...',
          });
          throw new Error(`Invalid request: ${error.message}`);
        }

        // For retryable errors, continue to retry logic below
        if (!isRetryableError(error)) {
          console.error('Non-retryable error, aborting:', error.message);
          throw new Error(`OpenAI API error: ${error.message}`);
        }

        // If this is the last attempt, don't wait
        if (attempt === maxAttempts) {
          console.error('Last attempt failed, giving up');
          break;
        }

        // Calculate delay and retry
        const isRateLimit = error.status === 429;
        const delay = calculateDelay(attempt, isRateLimit);

        console.log(
          `${isRateLimit ? 'Rate limited' : 'Server error'}, retrying in ${delay}ms...`,
          {
            attempt,
            maxAttempts,
            errorStatus: error.status,
            retryDelay: delay,
          },
        );
        await sleep(delay);
        continue;
      } else {
        if (!(error instanceof Error)) {
          throw error;
        }

        // Non-API errors (network, timeout, etc.)
        console.error(`Error (attempt ${attempt}/${maxAttempts}):`, {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines of stack
        });

        if (!isRetryableError(error)) {
          console.error(
            'Non-retryable network error, aborting:',
            error.message,
          );
          throw error;
        }

        if (attempt === maxAttempts) {
          console.error('Last network attempt failed, giving up');
          break;
        }

        const delay = calculateDelay(attempt);
        console.log(`Network error, retrying in ${delay}ms...`, {
          attempt,
          maxAttempts,
          errorType: error.name,
          retryDelay: delay,
        });
        await sleep(delay);
        continue;
      }
    }
  }

  if (!lastError) {
    throw new Error('Unexpected error execution');
  }

  // All attempts failed
  console.error(`All ${maxAttempts} attempts failed. Final error details:`, {
    errorType: lastError.name,
    errorMessage: lastError.message,
    isAPIError: lastError instanceof OpenAI.APIError,
    status: lastError instanceof OpenAI.APIError ? lastError.status : 'N/A',
  });

  if (lastError instanceof OpenAI.APIError) {
    if (lastError.status === 429) {
      throw new Error(
        'Rate limit exceeded after multiple retries. Please try again later.',
      );
    }
    if (lastError.status >= 500) {
      throw new Error(
        'OpenAI service is temporarily unavailable. Please try again later.',
      );
    }
    throw new Error(`OpenAI API error: ${lastError.message}`);
  }

  throw new Error(
    'Failed to connect to OpenAI service after multiple attempts. Please check your internet connection.',
  );
}

