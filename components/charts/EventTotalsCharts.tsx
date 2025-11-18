"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface EventTotalsData {
  chatMessages: ChartDataPoint[];
  articleClicks: ChartDataPoint[];
  articleViews: ChartDataPoint[];
}

export default function EventTotalsCharts() {
  const [data, setData] = useState<EventTotalsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEventTotals() {
      try {
        const response = await fetch('/api/analytics/event-totals');
        if (response.ok) {
          const eventData = await response.json();
          setData(eventData);
        } else {
          console.error('Failed to fetch event totals');
        }
      } catch (error) {
        console.error('Error fetching event totals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEventTotals();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Event Totals</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-64 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-64 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Event Totals</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Event Totals</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total User Chat Messages */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Total User Chat Messages</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.chatMessages}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={20}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Total Article Clicks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Total Article Clicks</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.articleClicks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={20}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Total Article Views */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Total Article Views</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.articleViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval={20}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

