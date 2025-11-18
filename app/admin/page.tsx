"use client";

import { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
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
      <AdminHeader
        title="Dashboard"
        showDateRange={true}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

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

