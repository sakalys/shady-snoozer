import { Platform, Platforms, Product } from './types';

interface GeneratePostsResponse {
  posts: Array<{
    platform: Platform;
    content: string;
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function generatePosts(
  product: Product,
  platforms: Platforms,
): Promise<GeneratePostsResponse> {
  const response = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ product, platforms }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}
