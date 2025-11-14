"use client";

import { useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface User {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  handle: string;
  optedIn: boolean;
  registered: string;
}

// Sample users data
const sampleUsers: User[] = [
  {
    id: '1',
    userId: '10504923',
    firstName: 'Matthew',
    lastName: 'Kenning',
    email: 'geneniechi05@gmail.com',
    handle: 'matthew-kenning',
    optedIn: false,
    registered: 'Nov 8, 2025, 11:36 AM'
  },
  {
    id: '2',
    userId: '9634885',
    firstName: 'Jenna',
    lastName: 'McEwan',
    email: 'Jmcewan@greenhaus.com',
    handle: 'jenna-mcewan',
    optedIn: false,
    registered: 'Oct 21, 2025, 11:05 AM'
  },
  {
    id: '3',
    userId: '9291979',
    firstName: 'Chrissie Ann',
    lastName: 'Smith',
    email: '2cvqb4nmd4@privaterelay.appleid.com',
    handle: 'chrissieann-smith',
    optedIn: false,
    registered: 'Oct 15, 2025, 1:51 PM'
  },
];

export default function UsersPage() {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [userFilter, setUserFilter] = useState('All registered users');
  const [users] = useState<User[]>(sampleUsers);

  const totalUsers = users.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader title="Users" subtitle="Visit Fort Myers • Live since August 2024" />

      {/* Main Content */}
      <div className="p-8">
        {/* Controls Row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {dateRange}
              <ChevronDown className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {userFilter}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
            <p className="text-sm text-gray-600">Users</p>
          </div>
          <button className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50">
            <Download className="h-5 w-5" />
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opted in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered (PT)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.firstName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.handle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.optedIn ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.registered}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

