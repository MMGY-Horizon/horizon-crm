"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4', '#a855f7', '#f43f5e', '#64748b'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface InterestData {
  name: string;
  value: number;
  percentage: string;
}

interface AnalyticsData {
  totalVisitors: number;
  seasons: InterestData[];
  travelerTypes: InterestData[];
  preferences: InterestData[];
  vibes: InterestData[];
}

export default function InterestsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics/interests');
        if (response.ok) {
          const analyticsData = await response.json();
          console.log('[InterestsCharts] Raw data:', analyticsData);
          console.log('[InterestsCharts] Seasons:', analyticsData.seasons);
          setData(analyticsData);
        } else {
          console.error('Failed to fetch interests analytics');
        }
      } catch (error) {
        console.error('Error fetching interests analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Visitor Interests & Preferences</h2>
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

  if (!data || data.totalVisitors === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Visitor Interests & Preferences</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500">No interest data available yet. Visitors will appear here once they select preferences.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Visitor Interests & Preferences</h2>
        <p className="text-sm text-gray-500">{data.totalVisitors} visitors with preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seasons */}
        {data.seasons.length > 0 && (() => {
          // Ensure data is properly formatted with string names
          console.log('[InterestsCharts] Original seasons data:', data.seasons);
          console.log('[InterestsCharts] First season entry:', data.seasons[0]);
          console.log('[InterestsCharts] First season name type:', typeof data.seasons[0]?.name);
          console.log('[InterestsCharts] First season name value:', data.seasons[0]?.name);

          const seasonData = data.seasons.map(s => {
            console.log('[InterestsCharts] Mapping season:', JSON.stringify(s, null, 2));
            console.log('[InterestsCharts] Season name:', s.name, 'Type:', typeof s.name);
            if (typeof s.name === 'object' && s.name !== null) {
              console.log('[InterestsCharts] Season name keys:', Object.keys(s.name));
              console.log('[InterestsCharts] Season name full:', JSON.stringify(s.name, null, 2));
            }

            // Extract string from name field
            let nameString: string;
            if (typeof s.name === 'string') {
              nameString = s.name;
            } else if (s.name && typeof s.name === 'object') {
              // Try common properties
              nameString = (s.name as any).name || (s.name as any).label || (s.name as any).value || JSON.stringify(s.name);
            } else {
              nameString = String(s.name);
            }

            return {
              name: nameString,
              value: s.value,
              percentage: s.percentage,
            };
          });

          console.log('[InterestsCharts] Transformed seasonData:', seasonData);

          return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Preferred Seasons</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={seasonData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {seasonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value} visitors`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })()}

        {/* Traveler Types */}
        {data.travelerTypes.length > 0 && (() => {
          // Ensure data is properly formatted with string names
          const travelerData = data.travelerTypes.map(t => ({
            name: typeof t.name === 'string' ? t.name : String(t.name),
            value: t.value,
            percentage: t.percentage,
          }));

          return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Traveler Types</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={travelerData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {travelerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value} visitors`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Top Preferences */}
      {data.preferences.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Activity Preferences</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.preferences} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip
                formatter={(value: any) => [`${value} visitors`, 'Count']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Vibes */}
      {data.vibes.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Vibes</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.vibes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip
                formatter={(value: any) => [`${value} visitors`, 'Count']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="value" fill="#22c55e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
