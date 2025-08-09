'use client';

import { useState } from 'react';
import { generatePosts } from '../api';
import { Platform, SocialMediaPost } from '../types';
import Post from './post';
import { PLATFORM_ICONS } from '@/util';

interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

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
    x: { count: 0 },
    instagram: { count: 0 },
    linkedin: { count: 0 },
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
    <div className="min-h-screen p-2 md:p-8">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGeneratePosts();
          }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-2 md:p-8 border border-white/20"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Social Media Post Generator
            </h1>
            <p className="text-gray-600">
              Create engaging content for your products across multiple
              platforms
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:p-6 rounded-xl border border-blue-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Product Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
                value={product.name}
                minLength={2}
                maxLength={100}
                onChange={(e) =>
                  setProduct({ ...product, name: e.target.value })
                }
                placeholder="EcoBottle Pro"
              />
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 md:p-6 rounded-xl border border-green-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm resize-vertical"
                rows={4}
                value={product.description}
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
                placeholder="Revolutionary reusable water bottle with built-in UV purification..."
              />
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 md:p-6 rounded-xl border border-amber-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Price
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
                value={product.price}
                min={1}
                max={999999.99}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="49.99"
              />
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-3 md:p-6 rounded-xl border border-rose-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category (optional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
                value={product.category || ''}
                onChange={(e) =>
                  setProduct({ ...product, category: e.target.value })
                }
                placeholder="Health & Wellness"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 md:p-6 rounded-xl border border-purple-100">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Platform Post Counts
            </label>
            <div className="grid gap-3">
              {Object.keys(PLATFORM_ICONS).map((platform) => (
                <div
                  key={platform}
                  className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40"
                >
                  <div className="flex items-center">
                    <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
                      {platform}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={platforms[platform as Platform].count}
                    onChange={(e) =>
                      setPlatforms({
                        ...platforms,
                        [platform]: { count: parseInt(e.target.value) },
                      })
                    }
                    className="w-16 px-2 py-1 bg-white/80 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center my-6">
            <button
              disabled={submitDisabled}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </div>
              ) : (
                'Generate Posts'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-xl border border-red-200 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}
        </form>

        {posts.length > 0 && (
          <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-2 md:p-8 border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Generated Posts
              </h2>
              <p className="text-gray-600 mt-2">
                Your content is ready to share!
              </p>
            </div>
            <div className="grid gap-6">
              {posts.map((post, index) => (
                <Post key={index} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
