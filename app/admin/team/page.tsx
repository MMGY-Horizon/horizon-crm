"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MoreHorizontal, Trash2, Edit2, RefreshCw, ChevronDown } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export default function TeamPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Member');
  const [adding, setAdding] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; userId: string; userName: string }>({
    show: false,
    userId: '',
    userName: '',
  });
  const [deleting, setDeleting] = useState(false);

  // Fetch users
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

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    setAdding(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newMemberEmail,
          name: newMemberName || null,
          role: newMemberRole,
        }),
      });

      if (response.ok) {
        setNewMemberEmail('');
        setNewMemberName('');
        setNewMemberRole('Member');
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteConfirm({ show: true, userId, userName });
    setShowMenu(null);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/users/${deleteConfirm.userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteConfirm({ show: false, userId: '', userName: '' });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
        setShowMenu(null);
      } else {
        alert('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Team" subtitle="Visit Fort Myers • Live since August 2024" />

      <div className="p-8">
        {/* Header with stats */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-600 mt-1">
              {users.length} {users.length === 1 ? 'member' : 'members'}
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

        {/* Team Members Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-visible mb-12">
          <div className="overflow-x-auto pb-24">
            <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Sign In
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-600">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading team members...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-600">
                    No team members found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || user.email}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-900">
                          {user.name || '-'}
                          {session?.user?.email === user.email && (
                            <span className="ml-2 text-xs text-gray-500">(You)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'Admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'Creator'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString() 
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setShowMenu(showMenu === user.id ? null : user.id)}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                        
                        {showMenu === user.id && (
                          <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                            <div className="py-1">
                              <button
                                onClick={() => handleUpdateRole(user.id, user.role === 'Admin' ? 'Member' : 'Admin')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="h-4 w-4" />
                                {user.role === 'Admin' ? 'Make Member' : 'Make Admin'}
                              </button>
                              {session?.user?.email !== user.email && (
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Add Member Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Add member</h3>
          <p className="text-sm text-gray-600 mb-4">
            Invite a new team member. They'll receive access once they sign in with Google.
          </p>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Name (optional)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="Member">Member</option>
                  <option value="Creator">Creator</option>
                  <option value="Admin">Admin</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
              <button
                onClick={handleAddMember}
                disabled={adding || !newMemberEmail}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <span className="text-lg">+</span> Add Member
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Remove Team Member</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove <span className="font-semibold">{deleteConfirm.userName}</span>? 
              They will lose access to the CRM immediately.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, userId: '', userName: '' })}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Remove Member
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
