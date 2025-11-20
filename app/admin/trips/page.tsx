"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Download, RefreshCw, MapPin, Calendar, Plane } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import Link from 'next/link';

interface Visitor {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface TripLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string | null;
  added_at: string;
}

interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  days: number | null;
  image_url: string | null;
  location_count: number;
  created_at: string;
  updated_at: string;
  visitor: Visitor | null;
}

export default function TripsPage() {
  const [dateRange, setDateRange] = useState('30'); // days
  const [dateRangeLabel, setDateRangeLabel] = useState('Last 30 days');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const [tripLocations, setTripLocations] = useState<Record<string, TripLocation[]>>({});
  const [loadingLocations, setLoadingLocations] = useState<Set<string>>(new Set());
  const itemsPerPage = 20;

  const dateRangeOptions = [
    { label: 'Last 7 days', value: '7' },
    { label: 'Last 30 days', value: '30' },
    { label: 'Last 90 days', value: '90' },
    { label: 'Last 365 days', value: '365' },
    { label: 'All time', value: 'all' },
  ];

  // Fetch trips from API
  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trips');

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch trips (${response.status})`);
      }

      const data = await response.json();
      setTrips(data.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchTrips();
  }, []);

  // Fetch trip locations
  const fetchTripLocations = async (tripId: string) => {
    if (tripLocations[tripId]) return;

    setLoadingLocations(prev => new Set(prev).add(tripId));

    try {
      const response = await fetch(`/api/trips/${tripId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch trip locations');
      }

      const data = await response.json();
      setTripLocations(prev => ({
        ...prev,
        [tripId]: data.trip.locations || []
      }));
    } catch (error) {
      console.error('Error fetching trip locations:', error);
    } finally {
      setLoadingLocations(prev => {
        const newSet = new Set(prev);
        newSet.delete(tripId);
        return newSet;
      });
    }
  };

  // Toggle trip expansion
  const toggleTrip = async (tripId: string) => {
    const newExpanded = new Set(expandedTrips);

    if (newExpanded.has(tripId)) {
      newExpanded.delete(tripId);
    } else {
      newExpanded.add(tripId);
      await fetchTripLocations(tripId);
    }

    setExpandedTrips(newExpanded);
  };

  // Filter trips based on date range and search query
  useEffect(() => {
    let filtered = [...trips];

    // Apply date filter
    if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.created_at);
        return tripDate >= cutoffDate;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trip =>
        trip.name.toLowerCase().includes(query) ||
        trip.destination.toLowerCase().includes(query) ||
        trip.visitor?.email.toLowerCase().includes(query)
      );
    }

    setFilteredTrips(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [trips, dateRange, searchQuery]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get visitor display name
  const getVisitorDisplay = (visitor: Visitor | null) => {
    if (!visitor) return 'Unknown';
    if (visitor.first_name || visitor.last_name) {
      return `${visitor.first_name || ''} ${visitor.last_name || ''}`.trim();
    }
    return visitor.email;
  };

  // Download CSV function
  const handleDownloadCSV = () => {
    const headers = ['Trip Name', 'Destination', 'Visitor', 'Visitor Email', 'Start Date', 'End Date', 'Days', 'Locations', 'Created'];
    const rows = filteredTrips.map(trip => [
      trip.name,
      trip.destination,
      getVisitorDisplay(trip.visitor),
      trip.visitor?.email || 'Unknown',
      formatDate(trip.start_date),
      formatDate(trip.end_date),
      trip.days?.toString() || 'N/A',
      trip.location_count.toString(),
      formatDate(trip.created_at),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `trips_${dateRangeLabel.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedTrips = filteredTrips.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader title="Trips" subtitle="Visit Fort Myers • Live since August 2024" />

      {/* Main Content */}
      <div className="p-8">
        {/* Controls Row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Date Range Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
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
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg cursor-pointer"
                    >
                      {option.label}
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
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center gap-8">
          <div>
            <p className="text-3xl font-bold text-gray-900">{filteredTrips.length}</p>
            <p className="text-sm text-gray-700 font-medium">Total Trips</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {filteredTrips.reduce((sum, trip) => sum + trip.location_count, 0)}
            </p>
            <p className="text-sm text-gray-700 font-medium">Total Locations</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {new Set(filteredTrips.map(t => t.visitor?.id).filter(Boolean)).size}
            </p>
            <p className="text-sm text-gray-700 font-medium">Unique Visitors</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={fetchTrips}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={filteredTrips.length === 0}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              title="Download as CSV"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header Row */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 grid grid-cols-12 gap-4">
            <div className="col-span-5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Trip
            </div>
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Visitor
            </div>
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Dates
            </div>
            <div className="col-span-1 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">
              Locations
            </div>
            <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Created
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-gray-600">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-600" />
                Loading trips...
              </div>
            ) : displayedTrips.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-600">
                No trips found. Try adjusting your filters or search query.
              </div>
            ) : (
              displayedTrips.map((trip) => {
                const isExpanded = expandedTrips.has(trip.id);
                const locations = tripLocations[trip.id] || [];
                const isLoadingLocations = loadingLocations.has(trip.id);

                return (
                  <div key={trip.id} className="border-b border-gray-200 last:border-b-0">
                    {/* Trip Row */}
                    <div
                      onClick={() => toggleTrip(trip.id)}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {/* Chevron + Trip Info */}
                      <div className="col-span-5 flex items-start gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                        )}
                        {trip.image_url ? (
                          <img
                            src={trip.image_url}
                            alt={trip.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Plane className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{trip.name}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{trip.destination}</div>
                        </div>
                      </div>

                      {/* Visitor */}
                      <div className="col-span-2 flex items-center text-sm text-gray-700">
                        {trip.visitor ? (
                          <Link
                            href={`/admin/users/${trip.visitor.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {getVisitorDisplay(trip.visitor)}
                          </Link>
                        ) : (
                          <span className="text-gray-500">Unknown</span>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="col-span-2 flex items-center text-sm text-gray-700">
                        {trip.start_date && trip.end_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs">
                              {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">No dates</span>
                        )}
                      </div>

                      {/* Locations */}
                      <div className="col-span-1 flex items-center justify-end text-sm text-gray-900 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {trip.location_count}
                        </div>
                      </div>

                      {/* Created */}
                      <div className="col-span-2 flex items-center text-sm text-gray-700">
                        {formatDate(trip.created_at)}
                      </div>
                    </div>

                    {/* Expanded Locations */}
                    {isExpanded && (
                      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        {isLoadingLocations ? (
                          <p className="text-sm text-gray-500">Loading locations...</p>
                        ) : locations.length > 0 ? (
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                              Saved Places ({locations.length})
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {locations.map((location) => (
                                <div
                                  key={location.id}
                                  className="bg-white rounded-lg p-3 flex items-start gap-3"
                                >
                                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-cyan-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900">{location.name}</p>
                                    {location.description && (
                                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                        {location.description}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                      {location.latitude?.toFixed(4) || 'N/A'}, {location.longitude?.toFixed(4) || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No places saved in this trip yet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              ‹
            </button>
            <span className="px-4 py-2 text-sm text-gray-700 font-medium">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
