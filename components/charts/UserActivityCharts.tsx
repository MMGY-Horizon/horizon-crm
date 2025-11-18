"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface ActivityData {
  uniqueUsers: ChartDataPoint[];
  chatMessages: ChartDataPoint[];
  registrations: ChartDataPoint[];
}

export default function UserActivityCharts() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivityData() {
      try {
        const response = await fetch('/api/analytics/user-activity');
        if (response.ok) {
          const activityData = await response.json();
          setData(activityData);
        } else {
          console.error('Failed to fetch activity data');
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivityData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Unique Users</h2>
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
        <h2 className="text-xl font-semibold text-gray-900">Unique Users</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">User Activity</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unique Users */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Unique Users</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.uniqueUsers}>
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

        {/* Users Who Sent Chat Message */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Users Who Sent Chat Message</h3>
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
      </div>

      {/* User Registrations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">User Registrations</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.registrations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={10}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

