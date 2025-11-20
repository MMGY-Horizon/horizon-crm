"use client";

import { useState, useEffect } from 'react';
import { MapPin, Calendar, ChevronDown, ChevronRight, Plane } from 'lucide-react';

interface TripLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
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
  image: string | null;
  location_count: number;
  created_at: string;
  updated_at: string;
}

interface TripWithLocations extends Trip {
  locations?: TripLocation[];
}

interface TripsSectionProps {
  visitorId: string;
}

export default function TripsSection({ visitorId }: TripsSectionProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const [tripLocations, setTripLocations] = useState<Record<string, TripLocation[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTrips();
  }, [visitorId]);

  const fetchTrips = async () => {
    try {
      const response = await fetch(`/api/trips?visitorId=${visitorId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch trips');
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Trips</h3>
        </div>
        <p className="text-sm text-gray-500">Loading trips...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Trips</h3>
        </div>
        <p className="text-sm text-gray-500">No trips created yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Plane className="w-5 h-5 text-cyan-600" />
        <h3 className="text-lg font-semibold text-gray-900">Trips</h3>
        <span className="text-sm text-gray-500">({trips.length})</span>
      </div>

      <div className="space-y-3">
        {trips.map((trip) => {
          const isExpanded = expandedTrips.has(trip.id);
          const locations = tripLocations[trip.id] || [];
          const isLoadingLocations = loadingLocations.has(trip.id);

          return (
            <div key={trip.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Trip Header */}
              <button
                onClick={() => toggleTrip(trip.id)}
                className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )}

                {trip.image ? (
                  <img
                    src={trip.image}
                    alt={trip.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Plane className="w-8 h-8 text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{trip.name}</h4>
                  <p className="text-sm text-gray-600">{trip.destination}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    {trip.days && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {trip.days} days
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {trip.location_count} places
                    </span>
                    {trip.start_date && trip.end_date && (
                      <span>
                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Locations */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  {isLoadingLocations ? (
                    <p className="text-sm text-gray-500">Loading locations...</p>
                  ) : locations.length > 0 ? (
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                        Saved Places ({locations.length})
                      </h5>
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
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No places saved in this trip yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
