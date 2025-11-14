"use client";

import AdminHeader from '@/components/admin/AdminHeader';
import UserCompositionCharts from '@/components/charts/UserCompositionCharts';
import UserActivityCharts from '@/components/charts/UserActivityCharts';
import EventTotalsCharts from '@/components/charts/EventTotalsCharts';
import SummaryMetrics from '@/components/charts/SummaryMetrics';
import ConversionRates from '@/components/charts/ConversionRates';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader />

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

