interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

interface GeneratePostsResponse {
  posts: Array<{
    platform: 'twitter' | 'instagram' | 'linkedin';
    content: string;
  }>;
  generated_at: string;
  count: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function generatePosts(product: Product): Promise<GeneratePostsResponse> {
  const response = await fetch(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }
  
  return data;
}