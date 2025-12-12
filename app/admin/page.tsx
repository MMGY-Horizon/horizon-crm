"use client";

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import UserCompositionCharts from '@/components/charts/UserCompositionCharts';
import UserActivityCharts from '@/components/charts/UserActivityCharts';
import EventTotalsCharts from '@/components/charts/EventTotalsCharts';
import SummaryMetrics from '@/components/charts/SummaryMetrics';
import ConversionRates from '@/components/charts/ConversionRates';
import InterestsCharts from '@/components/charts/InterestsCharts';
import WelcomePage from '@/components/WelcomePage';

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [hasData, setHasData] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the organization has any data
    Promise.all([
      fetch('/api/chats').then(res => res.json()),
      fetch('/api/visitors').then(res => res.json()),
    ])
      .then(([chatsData, visitorsData]) => {
        const totalChats = chatsData?.chats?.length || 0;
        const totalVisitors = visitorsData?.visitors?.length || 0;
        setHasData(totalChats > 0 || totalVisitors > 0);
      })
      .catch(err => {
        console.error('Error checking for data:', err);
        setHasData(false);
      });
  }, []);

  // Show loading state while checking for data
  if (hasData === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show welcome page if no data
  if (!hasData) {
    return <WelcomePage />;
  }

  // Show regular dashboard if there's data
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
        {/* Visitor Interests & Preferences */}
        <InterestsCharts />

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

