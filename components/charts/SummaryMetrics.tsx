"use client";

import { useState, useEffect } from 'react';

interface SummaryMetricsData {
  totalChats: number;
  totalMessages: number;
  totalVisitors: number;
  totalArticleClicks: number;
  totalArticleViews: number;
  totalPlacesTracked: number;
  engagedChats: number;
  uniqueSessions: number;
}

export default function SummaryMetrics() {
  const [data, setData] = useState<SummaryMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummaryMetrics() {
      try {
        const response = await fetch('/api/analytics/summary-metrics');
        if (response.ok) {
          const metricsData = await response.json();
          setData(metricsData);
        } else {
          console.error('Failed to fetch summary metrics');
        }
      } catch (error) {
        console.error('Error fetching summary metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummaryMetrics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Summary Metrics</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Summary Metrics</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      value: data.uniqueSessions.toLocaleString(),
      label: 'Total Unique Sessions',
      sublabel: 'Unique visitors to the concierge'
    },
    {
      value: data.totalChats.toLocaleString(),
      label: 'Total Chats',
      sublabel: 'All chat conversations'
    },
    {
      value: data.engagedChats.toLocaleString(),
      label: 'Engaged Chats',
      sublabel: 'Chats with at least one message'
    },
    {
      value: data.totalMessages.toLocaleString(),
      label: 'Total User Messages',
      sublabel: 'All messages sent by users'
    },
    {
      value: data.totalVisitors.toLocaleString(),
      label: 'Total Registrations',
      sublabel: 'Newsletter signups'
    },
    {
      value: data.totalArticleClicks.toLocaleString(),
      label: 'Total Article Clicks',
      sublabel: 'Clicks from Tavily search results'
    },
    {
      value: data.totalArticleViews.toLocaleString(),
      label: 'Total Article Views',
      sublabel: 'Article detail page visits'
    },
    {
      value: data.totalPlacesTracked.toLocaleString(),
      label: 'Total Places Tracked',
      sublabel: 'Unique articles mentioned or viewed'
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Summary Metrics</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-4xl font-bold text-gray-900 mb-2">{metric.value}</p>
            <p className="text-sm text-gray-600 leading-tight">{metric.label}</p>
            {metric.sublabel && (
              <p className="text-xs text-gray-500 mt-1">{metric.sublabel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

