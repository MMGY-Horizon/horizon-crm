"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Mail, Calendar } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import Toast from '@/components/Toast';

interface Visitor {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  created_at: string;
  last_active_at: string | null;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/visitors');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.visitors || []);
      }
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrichUnenrichedVisitors = async () => {
    setEnriching(true);
    try {
      const response = await fetch('/api/visitors/enrich', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Enrichment results:', data);

        // Refresh the user list after enrichment
        await fetchUsers();

        // Show success toast
        if (data.total === 0) {
          setToast({
            message: 'All visitors are already enriched!',
            type: 'success',
          });
        } else if (data.enriched > 0) {
          setToast({
            message: `Successfully enriched ${data.enriched} of ${data.total} visitors`,
            type: 'success',
          });
        } else {
          setToast({
            message: `No visitors could be enriched (${data.failed} failed)`,
            type: 'error',
          });
        }
      } else {
        const error = await response.json();
        setToast({
          message: `Enrichment failed: ${error.error}`,
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error enriching visitors:', error);
      setToast({
        message: 'Failed to enrich visitors. Please try again.',
        type: 'error',
      });
    } finally {
      setEnriching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter visitors
  const filteredUsers = users.filter(visitor => {
    const matchesSearch = 
      visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visitor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <AdminHeader />
      
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Visitors</h1>
            <p className="text-gray-600">
              Track and view all visitors using the concierge app
            </p>
          </div>
          <button
            onClick={enrichUnenrichedVisitors}
            disabled={loading || enriching}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            title="Enrich unenriched visitors with Apollo data"
          >
            <RefreshCw className={`h-5 w-5 ${enriching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, email, or name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
          <div className="overflow-x-auto pb-24">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Primary Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
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
                      Loading visitors...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-600">
                      {searchTerm ? 'No visitors found matching your search.' : 'No visitors found.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((visitor) => (
                    <tr 
                      key={visitor.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => router.push(`/admin/users/${visitor.id}`)}
                          className="font-mono text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                        >
                          {visitor.id.slice(0, 8)}...
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{visitor.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {visitor.name && visitor.name !== 'null null' ? visitor.name : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {visitor.source || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(visitor.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {visitor.last_active_at 
                          ? new Date(visitor.last_active_at).toLocaleDateString()
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
            Showing {filteredUsers.length} of {users.length} visitors
          </div>
        )}
      </div>
    </div>
  );
}
