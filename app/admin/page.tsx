"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import UserCompositionCharts from '@/components/charts/UserCompositionCharts';
import UserActivityCharts from '@/components/charts/UserActivityCharts';
import EventTotalsCharts from '@/components/charts/EventTotalsCharts';
import SummaryMetrics from '@/components/charts/SummaryMetrics';
import ConversionRates from '@/components/charts/ConversionRates';

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('Last 30 days');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Admin</h1>
            <p className="text-sm text-gray-500 mt-1">
              Total Users: 1,347 | Active Users: 801 | New Users (30d): 328
            </p>
          </div>
          
          {/* Date Range Selector */}
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {dateRange}
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-6 border-b border-gray-200">
          {['Dashboard', 'Chats', 'Places', 'Users', 'Settings', 'Team', 'Disaster', 'Create', 'Key Facts', 'Feedback', 'Web Integration'].map((tab) => (
            <button
              key={tab}
              className={`pb-3 text-sm font-medium transition-colors ${
                tab === 'Dashboard'
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-8">
        {/* User Composition Section */}
        <UserCompositionCharts />

        {/* User Activity Section */}
        <UserActivityCharts />

        {/* Event Totals Section */}
        <EventTotalsCharts />

        {/* Summary Metrics */}
        <SummaryMetrics />

        {/* Conversion Rates */}
        <ConversionRates />
      </div>
    </div>
  );
}

