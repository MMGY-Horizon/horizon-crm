"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  showDateRange?: boolean;
}

export default function AdminHeader({ 
  title = "Organization Admin", 
  subtitle = "Truckee-Tahoe • Live since August 2024",
  showDateRange = true 
}: AdminHeaderProps) {
  const [dateRange] = useState('Last 30 days');

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        
        {/* Date Range Selector */}
        {showDateRange && (
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {dateRange}
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

