"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  showDateRange?: boolean;
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
}

export default function AdminHeader({
  title = "Organization Admin",
  subtitle = "Visit Fort Myers • Live since August 2024",
  showDateRange = false,
  dateRange: externalDateRange,
  onDateRangeChange
}: AdminHeaderProps) {
  const [internalDateRange, setInternalDateRange] = useState('Last 30 days');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dateRange = externalDateRange ?? internalDateRange;

  const dateRangeOptions = [
    'Last 7 days',
    'Last 30 days',
    'Last 90 days',
    'Last 6 months',
    'Last year',
    'All time',
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateRangeSelect = (range: string) => {
    if (onDateRangeChange) {
      onDateRangeChange(range);
    } else {
      setInternalDateRange(range);
    }
    setShowDropdown(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        {/* Date Range Selector */}
        {showDateRange && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              {dateRange}
              <ChevronDown className="h-4 w-4" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleDateRangeSelect(option)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                      dateRange === option ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

