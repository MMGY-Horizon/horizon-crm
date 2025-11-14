"use client";

import { useState } from 'react';
import { ChevronDown, Search, Download } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface CrawledPage {
  id: string;
  number: number;
  url: string;
  crawledTime: string;
  mentions: number;
  clicks: number;
}

const samplePages: CrawledPage[] = [
  { id: '1', number: 1, url: '/things-to-do/outdoor-adventure', crawledTime: 'Nov 9, 2025, 10:01 PM', mentions: 7, clicks: 0 },
  { id: '2', number: 2, url: '/', crawledTime: 'Nov 9, 2025, 10:01 PM', mentions: 3, clicks: 1 },
  { id: '3', number: 3, url: '/things-to-do/water-activities', crawledTime: 'Nov 9, 2025, 10:02 PM', mentions: 2, clicks: 0 },
  { id: '4', number: 4, url: '/things-to-do/events-calendar/winter-events', crawledTime: 'Nov 9, 2025, 10:04 PM', mentions: 1, clicks: 0 },
  { id: '5', number: 5, url: '/things-to-do/hiking-trail-running', crawledTime: 'Nov 9, 2025, 10:02 PM', mentions: 1, clicks: 0 },
  { id: '6', number: 6, url: '/things-to-do/family-friendly-activities', crawledTime: 'Nov 9, 2025, 10:02 PM', mentions: 1, clicks: 0 },
  { id: '7', number: 7, url: '/things-to-do/rock-climbing', crawledTime: 'Nov 9, 2025, 10:15 PM', mentions: 0, clicks: 0 },
  { id: '8', number: 8, url: '/things-to-do/events/disco-tubing-at-palisades-tahoe', crawledTime: 'Nov 9, 2025, 10:15 PM', mentions: 0, clicks: 0 },
  { id: '9', number: 9, url: '/things-to-do/events/chalet-dinner-snowshoe-tour-at-alpine', crawledTime: 'Nov 9, 2025, 10:14 PM', mentions: 0, clicks: 0 },
  { id: '10', number: 10, url: '/things-to-do/events/holiday-block-party', crawledTime: 'Nov 9, 2025, 10:14 PM', mentions: 0, clicks: 0 },
  { id: '11', number: 11, url: '/things-to-do/events/downtown-holiday-festival-bud-fish-tree-lighting', crawledTime: 'Nov 9, 2025, 10:14 PM', mentions: 0, clicks: 0 },
  { id: '12', number: 12, url: '/things-to-do/events/ladies-night-downtown-truckee', crawledTime: 'Nov 9, 2025, 10:14 PM', mentions: 0, clicks: 0 },
  { id: '13', number: 13, url: '/things-to-do/events/old-lumberyard-holiday-tree-lighting', crawledTime: 'Nov 9, 2025, 10:14 PM', mentions: 0, clicks: 0 },
  { id: '14', number: 14, url: '/things-to-do/events/scriptshop-holiday-artisan-craft-faire', crawledTime: 'Nov 9, 2025, 10:14 PM', mentions: 0, clicks: 0 },
  { id: '15', number: 15, url: '/things-to-do/events/8th-annual-zombie-prom-at-fiftyfifty-brewing', crawledTime: 'Nov 9, 2025, 10:14 PM', mentions: 0, clicks: 0 },
  { id: '16', number: 16, url: '/things-to-do/events/autumn-wine-dinner-at-stella', crawledTime: 'Nov 9, 2025, 10:14 PM', mentions: 0, clicks: 0 },
  { id: '17', number: 17, url: '/things-to-do/events/msp-film-premiere-after-the-snowfall', crawledTime: 'Nov 9, 2025, 10:14 PM', mentions: 0, clicks: 0 },
  { id: '18', number: 18, url: '/things-to-do/events/tgr-film-premier-at-palisades-tahoe', crawledTime: 'Nov 9, 2025, 10:13 PM', mentions: 0, clicks: 0 },
  { id: '19', number: 19, url: '/things-to-do/events/avalanche-education-series-partner-up', crawledTime: 'Nov 9, 2025, 10:13 PM', mentions: 0, clicks: 0 },
  { id: '20', number: 20, url: '/things-to-do/events/avalanche-education-series-the-rescue', crawledTime: 'Nov 9, 2025, 10:13 PM', mentions: 0, clicks: 0 },
];

export default function CrawlerPage() {
  const [filterStatus, setFilterStatus] = useState('Active only');
  const [searchQuery, setSearchQuery] = useState('');
  const [pages] = useState<CrawledPage[]>(samplePages);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = 131;
  const totalFacts = 849;
  const totalPageCount = 7;

  const filteredPages = pages.filter(page =>
    page.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader subtitle="Truckee-Tahoe • Live since August 2024" />

      <div className="p-8">
        {/* Stats */}
        <div className="mb-6 flex items-center gap-8">
          <div>
            <p className="text-3xl font-bold text-gray-900">{totalPages}</p>
            <p className="text-sm text-gray-600">Pages</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{totalFacts}</p>
            <p className="text-sm text-gray-600">Facts</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Crawl History
            </button>
            <button className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="mb-6 flex items-center justify-between">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {filterStatus}
            <ChevronDown className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Crawled Page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Search
            </button>
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
                  Crawled Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crawled Time (PT)
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
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {page.number}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <a
                      href={`https://www.visittrucketahoe.com${page.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {page.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {page.crawledTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {page.mentions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {page.clicks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {currentPage} of {totalPageCount}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPageCount, currentPage + 1))}
            disabled={currentPage === totalPageCount}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

