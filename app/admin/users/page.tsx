"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Users as UsersIcon, Mail, Calendar } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  provider: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Get role counts
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getRoleBadge = (role: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      Admin: { bg: 'bg-purple-100', text: 'text-purple-800' },
      Creator: { bg: 'bg-blue-100', text: 'text-blue-800' },
      Member: { bg: 'bg-gray-100', text: 'text-gray-800' },
      Visitor: { bg: 'bg-green-100', text: 'text-green-800' },
    };
    
    const style = config[role] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Users</h1>
            <p className="text-gray-600">
              Manage and view all users across your platform
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            title="Refresh users"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UsersIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <UsersIcon className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Visitors</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{roleCounts['Visitor'] || 0}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Team Members</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {(roleCounts['Admin'] || 0) + (roleCounts['Creator'] || 0) + (roleCounts['Member'] || 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Mail className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Newsletter</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {users.filter(u => u.provider === 'newsletter').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="Visitor">Visitors</option>
                <option value="Admin">Admins</option>
                <option value="Creator">Creators</option>
                <option value="Member">Members</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
          <div className="overflow-x-auto pb-24">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-600">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-600">
                      {searchTerm || roleFilter !== 'all' ? 'No users found matching your filters.' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user.id}
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {user.provider || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>
    </div>
  );
}
