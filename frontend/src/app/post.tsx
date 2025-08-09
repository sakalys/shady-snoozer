'use client';

import { useState } from 'react';
import { SocialMediaPost } from '@/types';
import { PLATFORM_ICONS } from '@/util';

export default function Post({ post }: { post: SocialMediaPost }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy text:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = post.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <div className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-300 to-purple-400 rounded-full flex items-center justify-center text-white text-lg font-semibold">
          {PLATFORM_ICONS[post.platform]}
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-800 capitalize">
            {post.platform}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {post.content.length} characters
            </span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          {copied ? (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Copied
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </div>
          )}
        </button>
      </div>
      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-gray-100">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </div>
    </div>
  );
}
