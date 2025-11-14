"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Download, User, Bot } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({});
  const [loadingMessages, setLoadingMessages] = useState<Set<string>>(new Set());
  const [loadingChats, setLoadingChats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  const filteredChats = chats.filter(chat => {
    const query = searchQuery.toLowerCase();
    return (
      chat.chat_id.toLowerCase().includes(query) ||
      (chat.location?.toLowerCase() || '').includes(query) ||
      (chat.metadata?.topic_summary?.toLowerCase() || '').includes(query) ||
      chat.session_id.toLowerCase().includes(query)
    );
  });

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
            <p className="text-3xl font-bold text-gray-900">{formatCount(totalChats)}</p>
            <p className="text-sm text-gray-600">Chats</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatCount(totalMessages)}</p>
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
                  Score (1-5)
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
                      <button className="text-gray-400 hover:text-gray-600">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {chat.metadata?.userScore || '-'}
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

