"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight, Search, Download } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface Chat {
  id: string;
  chatId: string;
  location: string;
  topicSummary: string;
  userSat: number | string;
  intent: string;
  time: string;
  messages: number;
  expanded?: boolean;
}

// Sample chat data
const sampleChats: Chat[] = [
  {
    id: '1',
    chatId: '3312211',
    location: 'Rocklin, CA, US',
    topicSummary: 'Pending...',
    userSat: 'Pending',
    intent: 'Pending',
    time: 'Nov 14, 2025, 8:27 AM',
    messages: 2
  },
  {
    id: '2',
    chatId: '3310348',
    location: 'Fremont, CA, US',
    topicSummary: 'Romantic couples itinerary in Truckee with secluded trails, intimate restaurants, scenic drives, lakeside picnics, and stargazing.',
    userSat: 5,
    intent: 'Itinerary',
    time: 'Nov 14, 2025, 6:32 AM',
    messages: 2
  },
  {
    id: '3',
    chatId: '3310242',
    location: 'Los Angeles, CA, US',
    topicSummary: 'Adventure itinerary ideas in Truckee-Tahoe, California, with Spanish language support',
    userSat: 5,
    intent: 'Itinerary',
    time: 'Nov 14, 2025, 6:24 AM',
    messages: 2
  },
  {
    id: '4',
    chatId: '3307538',
    location: 'Lodi, CA, US',
    topicSummary: 'Romantic couples itinerary in Truckee with secluded trails, intimate dining, scenic drives, lakeside picnics, and stargazing',
    userSat: 5,
    intent: 'Itinerary',
    time: 'Nov 14, 2025, 2:47 AM',
    messages: 2
  },
  {
    id: '5',
    chatId: '3306787',
    location: 'San Jose, CA, US',
    topicSummary: 'Family-friendly Truckee itinerary with Thanksgiving week activity and dining suggestions',
    userSat: 5,
    intent: 'Itinerary',
    time: 'Nov 14, 2025, 1:43 AM',
    messages: 6
  },
  {
    id: '6',
    chatId: '3305125',
    location: 'Seattle, WA, US',
    topicSummary: 'Relaxing Truckee itinerary with scenic drives, lakeside walks, cozy cafes, gentle trails, and sunset spots',
    userSat: 5,
    intent: 'Itinerary',
    time: 'Nov 13, 2025, 10:48 PM',
    messages: 2
  },
  {
    id: '7',
    chatId: '3304577',
    location: 'Vineyard, CA, US',
    topicSummary: 'Family-friendly Truckee itinerary with trails, beaches, bike rentals, casual dining, and playgrounds',
    userSat: 5,
    intent: 'Itinerary',
    time: 'Nov 13, 2025, 9:54 PM',
    messages: 2
  },
  {
    id: '8',
    chatId: '3303672',
    location: 'Anderson, CA, US',
    topicSummary: 'Romantic couples itinerary in Truckee with secluded nature, intimate dining, scenic drives, lakeside picnics, and stargazing',
    userSat: 5,
    intent: 'Itinerary',
    time: 'Nov 13, 2025, 8:06 PM',
    messages: 2
  },
  {
    id: '9',
    chatId: '3303209',
    location: 'Lodi, CA, US',
    topicSummary: 'Romantic couples itinerary in Truckee with secluded outdoor experiences, intimate dining, scenic drives, lakeside picnics, and stargazing.',
    userSat: 5,
    intent: 'Itinerary',
    time: 'Nov 13, 2025, 7:28 PM',
    messages: 2
  },
  {
    id: '10',
    chatId: '3302940',
    location: 'Lodi, CA, US',
    topicSummary: 'Romantic couples itinerary in Truckee with secluded trails, intimate dining, scenic drives, lakeside picnics, and stargazing',
    userSat: 5,
    intent: 'Itinerary',
    time: 'Nov 13, 2025, 7:07 PM',
    messages: 2
  },
];

export default function ChatsPage() {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>(sampleChats);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalChats = 1200;
  const totalMessages = 1300;

  const toggleRow = (chatId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(chatId)) {
      newExpanded.delete(chatId);
    } else {
      newExpanded.add(chatId);
    }
    setExpandedRows(newExpanded);
  };

  const filteredChats = chats.filter(chat =>
    chat.chatId.includes(searchQuery) ||
    chat.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.topicSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredChats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedChats = filteredChats.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader title="Chats" subtitle="Truckee-Tahoe • Live since August 2024" />

      {/* Main Content */}
      <div className="p-8">
        {/* Controls Row */}
        <div className="mb-6 flex items-center justify-between">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {dateRange}
            <ChevronDown className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by chat ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Search
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center gap-8">
          <div>
            <p className="text-3xl font-bold text-gray-900">{(totalChats / 1000).toFixed(1)}K</p>
            <p className="text-sm text-gray-600">Chats</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{(totalMessages / 1000).toFixed(1)}K</p>
            <p className="text-sm text-gray-600">Messages</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Insights
            </button>
            <button className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chat ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Short Topic Summary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Sat. Est.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time (PT)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedChats.map((chat, index) => (
                <tr
                  key={chat.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleRow(chat.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-gray-400 hover:text-gray-600">
                      {expandedRows.has(chat.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs">
                        {chat.messages}
                      </span>
                      {chat.chatId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {chat.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                    <p className="line-clamp-2">{chat.topicSummary}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {chat.userSat}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {chat.intent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {chat.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

