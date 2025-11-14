"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  showDateRange?: boolean;
}

const tabs = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Chats', href: '/admin/chats' },
  { name: 'Places', href: '/admin/places' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Settings', href: '/admin/settings' },
  { name: 'Team', href: '/admin/team' },
  { name: 'Crawler', href: '/admin/crawler' },
  { name: 'Create', href: '/admin/create' },
  { name: 'Key Facts', href: '/admin/key-facts' },
  { name: 'Feedback', href: '/admin/feedback' },
  { name: 'Web Integration', href: '/admin/web-integration' },
];

export default function AdminHeader({ 
  title = "Organization Admin", 
  subtitle = "Total Users: 1,347 | Active Users: 801 | New Users (30d): 328",
  showDateRange = true 
}: AdminHeaderProps) {
  const [dateRange] = useState('Last 30 days');
  const pathname = usePathname();

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

      {/* Tabs */}
      <div className="flex gap-6 mt-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

