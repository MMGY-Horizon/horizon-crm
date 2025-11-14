"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const deviceData = [
  { name: 'Mobile', value: 74.4, color: '#22c55e' },
  { name: 'Desktop', value: 25.6, color: '#3b82f6' },
];

const cityData = [
  { name: 'Jacksonville', value: 16.4 },
  { name: 'San Jose', value: 8.9 },
  { name: 'Chicago', value: 6.6 },
  { name: 'Oakland', value: 3.9 },
  { name: 'San Francisco', value: 3.0 },
  { name: 'Phoenix', value: 2.8 },
  { name: 'San Antonio', value: 2.7 },
  { name: 'Dallas', value: 2.6 },
  { name: 'Fort Worth', value: 2.5 },
  { name: 'Philadelphia', value: 2.4 },
  { name: 'Indianapolis', value: 2.3 },
  { name: 'Oklahoma City', value: 2.1 },
  { name: 'Memphis', value: 2.0 },
  { name: 'Tulsa', value: 1.9 },
  { name: 'Louisville', value: 1.6 },
  { name: 'Other', value: 41.0 },
];

const countryData = [
  { name: 'United States', value: 1347 },
];

const topCitiesData = [
  { name: 'Jacksonville', value: 221, percent: 16.4, color: '#3b82f6' },
  { name: 'San Jose', value: 120, percent: 8.9, color: '#8b5cf6' },
  { name: 'Chicago', value: 89, percent: 6.6, color: '#ef4444' },
  { name: 'Oakland', value: 53, percent: 3.9, color: '#f59e0b' },
  { name: 'San Francisco', value: 40, percent: 3.0, color: '#10b981' },
  { name: 'Phoenix', value: 38, percent: 2.8, color: '#6366f1' },
  { name: 'San Antonio', value: 36, percent: 2.7, color: '#ec4899' },
  { name: 'Dallas', value: 35, percent: 2.6, color: '#14b8a6' },
  { name: 'Other', value: 315, percent: 23.4, color: '#9ca3af' },
];

export default function UserCompositionCharts() {
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
                  label={(entry) => `${entry.value}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => `${value}: ${entry.payload.value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <p className="text-3xl font-bold text-gray-900">1,347</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
        </div>

        {/* Users by Top 500 Cities */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Users by Top 500 Cities</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topCitiesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  label={false}
                >
                  {topCitiesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value} users`} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value, entry: any) => `${value}: ${entry.payload.percent}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <p className="text-3xl font-bold text-gray-900">801</p>
            <p className="text-sm text-gray-500">Active Users</p>
          </div>
        </div>
      </div>

      {/* Users by Country */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Users by Country</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={countryData}>
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

