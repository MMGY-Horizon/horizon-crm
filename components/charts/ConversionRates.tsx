"use client";

import { useState, useEffect } from 'react';

interface FunnelStage {
  label: string;
  value: number;
  percentage?: number;
}

interface FunnelProps {
  title: string;
  stages: FunnelStage[];
  finalConversion: {
    percentage: number;
    label: string;
  };
}

interface ConversionFunnel {
  stages: { label: string; value: number }[];
  conversionRate: number;
}

interface ConversionData {
  sessionToEngagement: ConversionFunnel;
  sessionToRegistration: ConversionFunnel;
  sessionToClick: ConversionFunnel;
  sessionToView: ConversionFunnel;
  engagedToRegistration: ConversionFunnel;
  engagedToClick: ConversionFunnel;
}

function FunnelChart({ title, stages, finalConversion }: FunnelProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-6">{title}</h3>
      
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const width = 100 - (index * 15); // Decreasing width for funnel effect
          
          return (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <div 
                  className="relative bg-gradient-to-r from-blue-500 to-blue-400 rounded py-3 transition-all duration-300 hover:shadow-md"
                  style={{ width: `${width}%` }}
                >
                  <div className="text-center">
                    <span className="text-sm font-medium text-white">{stage.label}</span>
                  </div>
                </div>
              </div>
              <div className="w-20 text-right">
                <p className="text-sm font-semibold text-gray-900">{stage.value.toLocaleString()}</p>
                {stage.percentage && (
                  <p className="text-xs text-gray-500">{stage.percentage}%</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <div className="inline-flex items-center gap-2">
          <span className="text-sm text-gray-600">{finalConversion.label}</span>
          <span className="text-2xl font-bold text-blue-600">{finalConversion.percentage}%</span>
        </div>
      </div>
    </div>
  );
}

export default function ConversionRates() {
  const [data, setData] = useState<ConversionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversionRates() {
      try {
        const response = await fetch('/api/analytics/conversion-rates');
        if (response.ok) {
          const conversionData = await response.json();
          setData(conversionData);
        } else {
          console.error('Failed to fetch conversion rates');
        }
      } catch (error) {
        console.error('Error fetching conversion rates:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchConversionRates();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Conversion Rates</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Conversion Rates</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const funnels = [
    {
      title: 'Session to Engagement',
      stages: data.sessionToEngagement.stages,
      finalConversion: {
        percentage: data.sessionToEngagement.conversionRate,
        label: 'Conversion Rate:'
      }
    },
    {
      title: 'Session to Registration',
      stages: data.sessionToRegistration.stages,
      finalConversion: {
        percentage: data.sessionToRegistration.conversionRate,
        label: 'Conversion Rate:'
      }
    },
    {
      title: 'Session to Article Click',
      stages: data.sessionToClick.stages,
      finalConversion: {
        percentage: data.sessionToClick.conversionRate,
        label: 'Conversion Rate:'
      }
    },
    {
      title: 'Engaged to Registration',
      stages: data.engagedToRegistration.stages,
      finalConversion: {
        percentage: data.engagedToRegistration.conversionRate,
        label: 'Conversion Rate:'
      }
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Conversion Rates</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {funnels.map((funnel, index) => (
          <FunnelChart key={index} {...funnel} />
        ))}
      </div>
    </div>
  );
}

