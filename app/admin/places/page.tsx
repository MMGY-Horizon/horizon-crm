"use client";

import { useState } from 'react';
import { ChevronDown, Search, Download, Check } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface Place {
  id: string;
  number: number;
  name: string;
  type: string;
  where: string;
  featured: boolean;
  mentions: number;
  views: number;
  handoffs: number;
}

// Sample places data
const samplePlaces: Place[] = [
  { id: '1', number: 1, name: 'Donner Lake', type: 'Attraction', where: 'Truckee', featured: false, mentions: 916, views: 2, handoffs: 0 },
  { id: '2', number: 2, name: 'Truckee River Legacy Trail - Glenshire Trailhead', type: 'Attraction', where: 'Truckee', featured: false, mentions: 678, views: 7, handoffs: 0 },
  { id: '3', number: 3, name: 'Cottonwood Restaurant and Bar', type: 'Restaurant', where: 'Truckee', featured: true, mentions: 644, views: 4, handoffs: 2 },
  { id: '4', number: 4, name: 'Moody\'s Bistro Bar & Beats', type: 'Restaurant', where: 'Truckee', featured: true, mentions: 499, views: 9, handoffs: 1 },
  { id: '5', number: 5, name: 'Old Hwy 40', type: 'Attraction', where: 'Truckee', featured: false, mentions: 451, views: 3, handoffs: 0 },
  { id: '6', number: 6, name: 'Martis Valley Trailhead', type: 'Attraction', where: 'Truckee', featured: false, mentions: 448, views: 3, handoffs: 0 },
  { id: '7', number: 7, name: 'Donner Lake Rim Trail Trailhead - Berngarten', type: 'Attraction', where: 'Truckee', featured: false, mentions: 425, views: 5, handoffs: 0 },
  { id: '8', number: 8, name: 'Martis Creek Wildlife Area', type: 'Attraction', where: 'Truckee', featured: false, mentions: 420, views: 3, handoffs: 0 },
  { id: '9', number: 9, name: 'Donner Summit Canyon', type: 'Attraction', where: 'Truckee', featured: false, mentions: 400, views: 5, handoffs: 0 },
  { id: '10', number: 10, name: 'Donner Memorial State Park', type: 'Attraction', where: 'Truckee', featured: false, mentions: 378, views: 3, handoffs: 0 },
  { id: '11', number: 11, name: 'Trout Creek Trail Trailhead', type: 'Attraction', where: 'Truckee', featured: false, mentions: 363, views: 7, handoffs: 0 },
  { id: '12', number: 12, name: 'Truckee Bike Park', type: 'Attraction', where: 'Truckee', featured: false, mentions: 357, views: 3, handoffs: 0 },
  { id: '13', number: 13, name: 'Martis Valley', type: 'Attraction', where: 'Truckee', featured: false, mentions: 343, views: 1, handoffs: 0 },
  { id: '14', number: 14, name: 'Pianeta', type: 'Restaurant', where: 'Truckee', featured: true, mentions: 303, views: 3, handoffs: 0 },
  { id: '15', number: 15, name: 'Donner Lake Overlook', type: 'Attraction', where: 'Truckee', featured: false, mentions: 294, views: 2, handoffs: 0 },
  { id: '16', number: 16, name: 'Historic Downtown Truckee & Visitor Center', type: 'Attraction', where: 'Truckee', featured: false, mentions: 284, views: 3, handoffs: 0 },
  { id: '17', number: 17, name: 'West End Beach', type: 'Attraction', where: 'Truckee', featured: false, mentions: 282, views: 0, handoffs: 0 },
  { id: '18', number: 18, name: 'Prosser Creek Reservoir', type: 'Attraction', where: 'Nevada County', featured: false, mentions: 242, views: 2, handoffs: 0 },
  { id: '19', number: 19, name: 'Bike Truckee', type: 'Attraction', where: 'Truckee', featured: false, mentions: 238, views: 1, handoffs: 0 },
  { id: '20', number: 20, name: 'Old Town Tap', type: 'Restaurant', where: 'Truckee', featured: true, mentions: 228, views: 2, handoffs: 1 },
];

export default function PlacesPage() {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [showFilter, setShowFilter] = useState('Show all');
  const [searchQuery, setSearchQuery] = useState('');
  const [places] = useState<Place[]>(samplePlaces);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalMentioned = 17900;
  const totalFeatured = 36;
  const totalHandoffs = 43;

  // Format number with K only if >= 1000
  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.where.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All types' || place.type === typeFilter;
    const matchesFeatured = showFilter === 'Show all' || 
                           (showFilter === 'Featured only' && place.featured);
    return matchesSearch && matchesType && matchesFeatured;
  });

  const totalPages = 21; // Simulated total pages
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedPlaces = filteredPlaces.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader title="Places" subtitle="Truckee-Tahoe • Live since August 2024" />

      {/* Main Content */}
      <div className="p-8">
        {/* Controls Row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {dateRange}
              <ChevronDown className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {typeFilter}
              <ChevronDown className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {showFilter}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search place name..."
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

        {/* Stats */}
        <div className="mb-6 flex items-center gap-8">
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatCount(totalMentioned)}</p>
            <p className="text-sm text-gray-600">Mentioned</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatCount(totalFeatured)}</p>
            <p className="text-sm text-gray-600">Featured</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatCount(totalHandoffs)}</p>
            <p className="text-sm text-gray-600">Handoffs</p>
          </div>
          <div className="ml-auto">
            <button className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50">
              <Download className="h-5 w-5" />
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Where
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Featured
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Mentions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Views
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Handoffs
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedPlaces.map((place) => (
                <tr
                  key={place.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {place.number}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {place.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {place.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {place.where}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {place.featured && (
                      <Check className="h-4 w-4 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {place.mentions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {place.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {place.handoffs}
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
      </div>
    </div>
  );
}

