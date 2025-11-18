"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#14b8a6', '#9ca3af'];

interface DeviceData {
  name: string;
  value: number;
  percentage: string;
}

interface CityData {
  name: string;
  value: number;
  percentage: string;
}

interface CountryData {
  name: string;
  value: number;
  percentage: string;
}

interface AnalyticsData {
  totalChats: number;
  devices: DeviceData[];
  cities: CityData[];
  countries: CountryData[];
}

export default function UserCompositionCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics/user-composition');
        if (response.ok) {
          const analyticsData = await response.json();
          setData(analyticsData);
        } else {
          console.error('Failed to fetch analytics');
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">User Composition</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-96 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-96 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">User Composition</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  // Prepare device data with colors
  const deviceData = data.devices
    .filter(d => d.name !== 'Unknown')
    .map((device, idx) => ({
      ...device,
      color: device.name === 'Mobile' ? '#22c55e' : '#3b82f6',
    }));

  // Prepare city data with colors
  const cityDataWithColors = data.cities.map((city, idx) => ({
    ...city,
    color: city.name === 'Other' ? '#9ca3af' : COLORS[idx % COLORS.length],
  }));
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">User Composition</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Device Type */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Users by Device Type</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="value"
                  label={(entry: any) => `${entry.percentage}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => `${value}: ${entry.payload.percentage}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <p className="text-3xl font-bold text-gray-900">{data.totalChats.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Chats</p>
          </div>
        </div>

        {/* Users by Top Cities */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Users by Top Cities</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cityDataWithColors}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  label={false}
                >
                  {cityDataWithColors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value} chats`} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value, entry: any) => `${value}: ${entry.payload.percentage}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <p className="text-3xl font-bold text-gray-900">{data.cities.length}</p>
            <p className="text-sm text-gray-500">Cities</p>
          </div>
        </div>
      </div>

      {/* Users by Country */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Users by Country</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.countries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

