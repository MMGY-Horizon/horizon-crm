"use client";

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function WelcomePage() {
  const [apiKey, setApiKey] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the API key from settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.api_key) {
          setApiKey(data.api_key);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching API key:', err);
        setLoading(false);
      });
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-xl p-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome to Horizon CRM!</h1>
            <p className="text-xl text-gray-600">Your analytics platform is ready to go.</p>
          </div>

          {/* API Key Section */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your API Key</h2>
              <span className="text-sm text-gray-500">Keep this secure</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-white px-4 py-3 rounded-lg border border-gray-200 font-mono text-sm text-gray-800 break-all">
                  {apiKey || 'Loading...'}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {/* Getting Started Steps */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Configure Your Concierge</h3>
                  <p className="text-gray-600">
                    Add your API key to your Horizon Concierge instance's environment variables:
                  </p>
                  <code className="block mt-2 bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800">
                    CRM_API_KEY={apiKey || 'your-api-key'}
                  </code>
                  <code className="block mt-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800">
                    CRM_URL=http://localhost:3001
                  </code>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Start Using Your Concierge</h3>
                  <p className="text-gray-600">
                    Once configured, your concierge will automatically send chat conversations, article views, and visitor data to this CRM.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">View Your Analytics</h3>
                  <p className="text-gray-600">
                    Return to this dashboard to see real-time analytics, visitor tracking, chat summaries, and conversion metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">What You'll Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-gray-900">Visitor Tracking</p>
                  <p className="text-sm text-gray-600">Track unique visitors and their interactions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-gray-900">Chat Analytics</p>
                  <p className="text-sm text-gray-600">AI-powered chat summaries and lead scoring</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-gray-900">Article Mentions</p>
                  <p className="text-sm text-gray-600">See which articles are mentioned in chats</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-gray-900">Conversion Metrics</p>
                  <p className="text-sm text-gray-600">Track newsletter signups and conversions</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
              Need help? Check out the{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1">
                documentation
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
