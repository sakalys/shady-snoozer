'use client';

import { useState } from 'react';
import { generatePosts } from '../api';
import { Platform } from '../types';

interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

interface SocialMediaPost {
  platform: Platform;
  content: string;
}

const PLATFORM_ICONS: Record<Platform, string> = {
  x: '𝕏',
  instagram: '📷',
  linkedin: '💼',
};

export default function Home() {
  const [product, setProduct] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    category: '',
  });
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [platforms, setPlatforms] = useState<
    Record<Platform, { count: number }>
  >({
    x: { count: 1 },
    instagram: { count: 1 },
    linkedin: { count: 1 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPlatforms = Object.entries(platforms)
    .filter(([, { count }]) => count > 0)
    .reduce(
      (acc, [platform, { count }]) => {
        acc[platform as Platform] = { count };
        return acc;
      },
      {} as Record<Platform, { count: number }>,
    );

  const submitDisabled =
    loading ||
    !product.name ||
    !product.description ||
    !product.description ||
    Object.keys(selectedPlatforms).length === 0;

  const handleGeneratePosts = async () => {
    setLoading(true);
    setError('');
    setPosts([]);

    try {
      const result = await generatePosts(product, selectedPlatforms);
      setPosts(result.posts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="min-h-screen p-8 max-w-4xl mx-auto" onSubmit={(e) => {
      e.preventDefault()
      handleGeneratePosts()
    }}>
      <h1 className="text-3xl font-bold mb-8">Social Media Post Generator</h1>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            placeholder="EcoBottle Pro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Select Platforms and Counts
          </label>
          {Object.keys(PLATFORM_ICONS).map((platform) => (
            <div key={platform} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={platforms[platform as Platform].count > 0}
                onChange={(e) =>
                  setPlatforms({
                    ...platforms,
                    [platform]: { count: e.target.checked ? 1 : 0 },
                  })
                }
              />
              <span className="ml-2">{platform}</span>
              {platforms[platform as Platform].count > 0 && (
                <input
                  type="number"
                  min="1"
                  value={platforms[platform as Platform].count}
                  onChange={(e) =>
                    setPlatforms({
                      ...platforms,
                      [platform]: { count: parseInt(e.target.value, 10) || 1 },
                    })
                  }
                  className="ml-2 w-16 px-2 py-1 border rounded-md"
                />
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            placeholder="Revolutionary reusable water bottle with built-in UV purification..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-md"
            value={product.price}
            min={1}
            max={999999.99}
            onChange={(e) =>
              setProduct({ ...product, price: parseFloat(e.target.value) || 0 })
            }
            placeholder="49.99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Category (optional)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            value={product.category || ''}
            onChange={(e) =>
              setProduct({ ...product, category: e.target.value })
            }
            placeholder="Health & Wellness"
          />
        </div>
      </div>

      <button
        disabled={submitDisabled}
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Generating...' : 'Generate Posts'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {posts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Generated Posts</h2>
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {PLATFORM_ICONS[post.platform]}
                  </span>
                  <span className="font-medium text-sm text-gray-600 capitalize">
                    {post.platform}
                  </span>
                  <span className="text-xs text-gray-400">
                    {post.content.length} chars
                  </span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
