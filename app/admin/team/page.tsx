"use client";

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'David Kenworthy',
    email: 'dkenworthy@originoutside.com',
    role: 'Admin'
  },
  {
    id: '2',
    name: '',
    email: 'eshell@mmgy.com',
    role: 'Admin'
  },
  {
    id: '3',
    name: 'Jackie Calvert',
    email: 'info@visittrucketahoe.com',
    role: 'Creator'
  },
  {
    id: '4',
    name: 'Jay Callicott',
    email: 'jcallicott@mmgy.com',
    role: 'Admin'
  },
  {
    id: '5',
    name: '',
    email: 'jcalvert@visittrucketahoe.com',
    role: 'Admin'
  },
  {
    id: '6',
    name: 'Lindsay Wilson',
    email: 'lwilson@originoutside.com',
    role: 'Admin'
  },
  {
    id: '7',
    name: 'Tracy Weingard',
    email: 'tweingard@visittrucketahoe.com',
    role: 'Admin'
  },
];

export default function TeamPage() {
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handleAddMember = () => {
    if (newMemberEmail.trim()) {
      console.log('Adding member:', newMemberEmail);
      setNewMemberEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Team" subtitle="Visit Fort Myers • Live since August 2024" />

      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Team Members</h2>

        {/* Team Members Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-12">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {member.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {member.role}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Member Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Add member</h3>
          <p className="text-sm text-gray-600 mb-4">
            The user will be emailed an invitation to join your team with an Admin role.
          </p>
          
          <div className="flex gap-3">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddMember}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              <span className="text-lg">+</span> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

