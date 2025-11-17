"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, Search, Download, RefreshCw } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface Place {
  id: string;
  name: string;
  slug: string;
  type: string;
  mentions: number;
  views: number;
}

interface ArticleStats {
  articles: Place[];
  totals: {
    totalMentioned: number;
    totalViews: number;
    uniqueArticles: number;
  };
}

export default function PlacesPage() {
  const [dateRange, setDateRange] = useState('30'); // days
  const [dateRangeLabel, setDateRangeLabel] = useState('Last 30 days');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All types');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalMentioned: 0,
    totalViews: 0,
    uniqueArticles: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const dateRangeOptions = [
    { label: 'Last 7 days', value: '7' },
    { label: 'Last 30 days', value: '30' },
    { label: 'Last 90 days', value: '90' },
    { label: 'Last 365 days', value: '365' },
  ];

  const typeOptions = [
    'All types',
    'Search Result',
    'Article',
    'Attraction',
    'Restaurant',
    'Activity',
  ];

  // Fetch article stats from API
  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        dateRange,
        type: typeFilter !== 'All types' ? typeFilter : '',
        search: searchQuery,
      });

      const response = await fetch(`/api/articles/stats?${params}`);
      console.log('API Response Status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        throw new Error(`Failed to fetch article stats (${response.status}): ${errorData.error || response.statusText}`);
      }

      const data: ArticleStats = await response.json();
      setPlaces(data.articles);
      setTotals(data.totals);
    } catch (error) {
      console.error('Error fetching article stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchStats();
  }, [dateRange, typeFilter, searchQuery]);

  // Format number with K only if >= 1000
  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Download CSV function
  const handleDownloadCSV = () => {
    const headers = ['Name', 'Slug', 'Type', 'Mentions', 'Views'];
    const rows = places.map(place => [
      place.name,
      place.slug,
      place.type,
      place.mentions.toString(),
      place.views.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `places_${dateRangeLabel.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(places.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedPlaces = places.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader title="Places" subtitle="Visit Fort Myers • Live since August 2024" />

      {/* Main Content */}
      <div className="p-8">
        {/* Controls Row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Date Range Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {dateRangeLabel}
                <ChevronDown className="h-4 w-4" />
              </button>
              {showDateDropdown && (
                <div className="absolute left-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                  {dateRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDateRange(option.value);
                        setDateRangeLabel(option.label);
                        setShowDateDropdown(false);
                        setCurrentPage(1);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Type Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {typeFilter}
                <ChevronDown className="h-4 w-4" />
              </button>
              {showTypeDropdown && (
                <div className="absolute left-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                  {typeOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setTypeFilter(option);
                        setShowTypeDropdown(false);
                        setCurrentPage(1);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search article name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center gap-8">
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatCount(totals.totalMentioned)}</p>
            <p className="text-sm text-gray-700 font-medium">Total Mentions</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatCount(totals.totalViews)}</p>
            <p className="text-sm text-gray-700 font-medium">Total Views</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatCount(totals.uniqueArticles)}</p>
            <p className="text-sm text-gray-700 font-medium">Unique Articles</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button 
              onClick={fetchStats}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleDownloadCSV}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
              title="Download as CSV"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                  Mentions
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                  Views
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-600">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-600" />
                    Loading article stats...
                  </td>
                </tr>
              ) : displayedPlaces.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-600">
                    No articles found. Try adjusting your filters or search query.
                  </td>
                </tr>
              ) : (
                displayedPlaces.map((place, index) => (
                  <tr
                    key={place.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      <div>
                        <div className="font-semibold text-gray-900">{place.name}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{place.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {place.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {place.mentions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {place.views}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <span className="px-4 py-2 text-sm text-gray-700 font-medium">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

