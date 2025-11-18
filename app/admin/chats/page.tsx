"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Search, Download, User, Bot, RefreshCw } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface Chat {
  id: string;
  chat_id: string;
  session_id: string;
  location: string | null;
  status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export default function ChatsPage() {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({});
  const [loadingMessages, setLoadingMessages] = useState<Set<string>>(new Set());
  const [loadingChats, setLoadingChats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  const dateRangeOptions = [
    'Last 7 days',
    'Last 30 days',
    'Last 90 days',
    'Last 6 months',
    'Last year',
    'All time'
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch chats from API
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoadingChats(true);
        const response = await fetch('/api/chats');
        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, []);

  const totalChats = chats.length;
  const totalMessages = chats.reduce((sum, chat) => sum + chat.message_count, 0);

  const handleDownloadCSV = () => {
    // Prepare CSV data
    const headers = ['Chat ID', 'Session ID', 'Location', 'Topic Summary', 'Lead Score (0-10)', 'Satisfaction (1-5)', 'Sentiment', 'Topics', 'Conversion Signals', 'Message Count', 'Status', 'Created At', 'Updated At'];
    
    const rows = filteredChats.map(chat => [
      chat.chat_id,
      chat.session_id,
      chat.location || 'N/A',
      chat.metadata?.topicSummary || 'Pending...',
      chat.metadata?.leadScore || '-',
      chat.metadata?.userScore || '-',
      chat.metadata?.sentiment || '-',
      chat.metadata?.topics?.join('; ') || '-',
      chat.metadata?.conversionSignals?.join('; ') || '-',
      chat.message_count,
      chat.status,
      new Date(chat.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      new Date(chat.updated_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    ]);

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Escape cells containing commas, quotes, or newlines
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `horizon-crm-chats-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefreshSummaries = async () => {
    setRefreshing(true);
    setRefreshMessage(null);
    
    try {
      const response = await fetch('/api/admin/refresh-summaries', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        if (data.successCount > 0) {
          setRefreshMessage(`✓ Summarized ${data.successCount} chat${data.successCount > 1 ? 's' : ''}${data.totalSkipped ? ` (${data.totalSkipped} already up to date)` : ''}`);
          // Refresh the chats list
          const chatsResponse = await fetch('/api/chats');
          if (chatsResponse.ok) {
            const chatsData = await chatsResponse.json();
            setChats(chatsData);
          }
        } else {
          setRefreshMessage(`✓ All chats are up to date (${data.skippedCount || 0} chats)`);
        }
      } else {
        setRefreshMessage(`✗ Error: ${data.error || 'Failed to refresh'}`);
      }
    } catch (error) {
      console.error('Error refreshing summaries:', error);
      setRefreshMessage('✗ Failed to refresh summaries');
    } finally {
      setRefreshing(false);
      // Clear message after 5 seconds
      setTimeout(() => setRefreshMessage(null), 5000);
    }
  };

  // Format number with K only if >= 1000
  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const fetchMessages = async (chatId: string) => {
    // Don't fetch if already loaded
    if (chatMessages[chatId]) return;

    setLoadingMessages(prev => new Set(prev).add(chatId));

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`);

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();

      setChatMessages(prev => ({
        ...prev,
        [chatId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(prev => {
        const next = new Set(prev);
        next.delete(chatId);
        return next;
      });
    }
  };

  const toggleRow = (chatId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(chatId)) {
      newExpanded.delete(chatId);
    } else {
      newExpanded.add(chatId);
      fetchMessages(chatId);
    }
    setExpandedRows(newExpanded);
  };

  // Filter by date range
  const getDateThreshold = () => {
    const now = new Date();
    switch (dateRange) {
      case 'Last 7 days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'Last 30 days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'Last 90 days':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'Last 6 months':
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case 'Last year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case 'All time':
      default:
        return new Date(0); // Beginning of time
    }
  };

  const filteredChats = chats.filter(chat => {
    // Date filter
    const chatDate = new Date(chat.created_at);
    const threshold = getDateThreshold();
    if (chatDate < threshold) return false;

    // Search filter
    const query = searchQuery.toLowerCase();
    return (
      chat.chat_id.toLowerCase().includes(query) ||
      (chat.location?.toLowerCase() || '').includes(query) ||
      (chat.metadata?.topicSummary?.toLowerCase() || '').includes(query) ||
      chat.session_id.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredChats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedChats = filteredChats.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader title="Chats" subtitle="Visit Fort Myers • Live since August 2024" />

      {/* Main Content */}
      <div className="p-8">
        {/* Date Filter */}
        <div className="mb-6">
          <div className="relative inline-block" ref={dateDropdownRef}>
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              {dateRange}
              <ChevronDown className="h-4 w-4" />
            </button>

            {showDateDropdown && (
              <div className="absolute z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setDateRange(option);
                      setShowDateDropdown(false);
                      setCurrentPage(1); // Reset to first page
                    }}
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
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by chat ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex items-center gap-8">
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatCount(totalChats)}</p>
            <p className="text-sm text-gray-600">Chats</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatCount(totalMessages)}</p>
            <p className="text-sm text-gray-600">Messages</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {refreshMessage && (
              <div className={`text-sm px-3 py-1 rounded ${
                refreshMessage.startsWith('✓') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {refreshMessage}
              </div>
            )}
            <button 
              onClick={handleRefreshSummaries}
              disabled={refreshing}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={handleDownloadCSV}
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
              title="Download as CSV"
            >
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
                  Lead Score (0-10)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time (PT)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingChats ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                    </div>
                    <p className="mt-4 text-sm text-gray-500">Loading chats...</p>
                  </td>
                </tr>
              ) : displayedChats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-sm text-gray-500">
                    No chats found. {searchQuery && 'Try adjusting your search.'}
                  </td>
                </tr>
              ) : displayedChats.map((chat, index) => (
                <React.Fragment key={chat.id}>
                  <tr
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleRow(chat.chat_id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        {expandedRows.has(chat.chat_id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs">
                          {chat.message_count}
                        </span>
                        {chat.chat_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {chat.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                      <p className="line-clamp-2">{chat.metadata?.topicSummary || 'Pending...'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {chat.metadata?.leadScore !== undefined ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          chat.metadata.leadScore >= 8 ? 'bg-red-100 text-red-800' :
                          chat.metadata.leadScore >= 6 ? 'bg-orange-100 text-orange-800' :
                          chat.metadata.leadScore >= 4 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {chat.metadata.leadScore === 10 ? '🔥 ' : 
                           chat.metadata.leadScore >= 8 ? '🌶️ ' :
                           chat.metadata.leadScore >= 6 ? '⚡ ' : ''}
                          {chat.metadata.leadScore}/10
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(chat.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                  </tr>

                  {/* Expanded Row - Chat Transcript */}
                  {expandedRows.has(chat.chat_id) && (
                    <tr key={`${chat.id}-expanded`}>
                      <td colSpan={6} className="px-6 py-6 bg-gray-50">
                        <div className="max-w-4xl">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Chat Transcript</h3>

                          {loadingMessages.has(chat.chat_id) ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                            </div>
                          ) : chatMessages[chat.chat_id]?.length > 0 ? (
                            <div className="space-y-4">
                              {chatMessages[chat.chat_id].map((message, idx) => (
                                <div
                                  key={message.id || idx}
                                  className={`flex gap-3 ${
                                    message.role === 'user' ? 'justify-start' : 'justify-start'
                                  }`}
                                >
                                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                    message.role === 'user'
                                      ? 'bg-blue-100 text-blue-600'
                                      : 'bg-gray-800 text-white'
                                  }`}>
                                    {message.role === 'user' ? (
                                      <User className="h-4 w-4" />
                                    ) : (
                                      <Bot className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-gray-900">
                                        {message.role === 'user' ? 'User' : 'Assistant'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(message.created_at).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className={`rounded-lg px-4 py-3 text-sm ${
                                      message.role === 'user'
                                        ? 'bg-white border border-gray-200'
                                        : 'bg-white border border-gray-200'
                                    }`}>
                                      <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No messages found for this chat.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            ‹
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

