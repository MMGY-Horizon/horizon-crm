"use client";

import { useState, useEffect } from 'react';
import { Search, Download, RefreshCw } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface ArticleMention {
  url: string;
  title: string;
  type: string;
  mentions: number;
  clicks: number;
  lastMentioned: string;
}

export default function CrawlerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mentions, setMentions] = useState<ArticleMention[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMentions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tavily-mentions');
      if (response.ok) {
        const data = await response.json();
        setMentions(data.mentions || []);
      }
    } catch (error) {
      console.error('Error fetching mentions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentions();
  }, []);

  const filteredMentions = mentions.filter(mention =>
    mention.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mention.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMentions = mentions.reduce((sum, m) => sum + m.mentions, 0);
  const totalClicks = mentions.reduce((sum, m) => sum + m.clicks, 0);

  const downloadCSV = () => {
    // Create CSV content
    const headers = ['Article URL', 'Article Title', 'Type', 'Mentions', 'Clicks', 'Last Mentioned'];
    const rows = filteredMentions.map(mention => [
      mention.url,
      mention.title || '',
      mention.type || '',
      mention.mentions.toString(),
      mention.clicks.toString(),
      new Date(mention.lastMentioned).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `article-mentions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader title="Crawler" subtitle="Visit Fort Myers • Live since August 2024" />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Crawler" subtitle="Visit Fort Myers • Live since August 2024" />

      <div className="p-8">
        {/* Stats */}
        <div className="mb-6 flex items-center gap-8">
          <div>
            <p className="text-3xl font-bold text-gray-900">{mentions.length}</p>
            <p className="text-sm text-gray-600">Unique Articles</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{totalMentions}</p>
            <p className="text-sm text-gray-600">Total Mentions</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
            <p className="text-sm text-gray-600">Total Clicks</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={fetchMentions}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={downloadCSV}
              disabled={mentions.length === 0}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Download CSV"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Mentioned
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Mentions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Clicks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMentions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-600">
                    No article mentions found. Mentions will appear here when the Concierge returns Tavily search results.
                  </td>
                </tr>
              ) : (
                filteredMentions.map((mention, index) => (
                  <tr key={mention.url} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={mention.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {mention.title || mention.url}
                      </a>
                      {mention.type && (
                        <span className="ml-2 text-xs text-gray-500">({mention.type})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(mention.lastMentioned).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {mention.mentions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {mention.clicks}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

