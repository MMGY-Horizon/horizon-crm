"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Eye, Mail, Calendar, RefreshCw, ChevronDown, ChevronRight, User, Bot, Briefcase, MapPin, Linkedin, Building2, Globe } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface Visitor {
  id: string;
  email: string;
  name: string | null;
  source: string;
  created_at: string;
  last_active_at: string | null;
  // Apollo enrichment data
  apollo_id: string | null;
  first_name: string | null;
  last_name: string | null;
  linkedin_url: string | null;
  title: string | null;
  headline: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  company_name: string | null;
  company_website: string | null;
  company_industry: string | null;
  apollo_enriched_at: string | null;
  apollo_last_synced_at: string | null;
}

interface Chat {
  id: string;
  chat_id: string;
  created_at: string;
  message_count: number;
  topic_summary: string | null;
  leadScore: number | null;
  sentiment: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface ArticleView {
  id: string;
  article_id: string;
  article_name: string;
  article_type: string;
  viewed_at: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<Visitor | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [views, setViews] = useState<ArticleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({});
  const [loadingMessages, setLoadingMessages] = useState<Set<string>>(new Set());

  const visitorId = params.id as string;

  const fetchMessages = async (chatId: string) => {
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

  const toggleChat = (chatId: string) => {
    const newExpanded = new Set(expandedChats);
    if (newExpanded.has(chatId)) {
      newExpanded.delete(chatId);
    } else {
      newExpanded.add(chatId);
      fetchMessages(chatId);
    }
    setExpandedChats(newExpanded);
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch visitor details
      const visitorResponse = await fetch(`/api/visitors/${visitorId}`);
      if (visitorResponse.ok) {
        const visitorData = await visitorResponse.json();
        setUser(visitorData.visitor);
      }

      // Fetch visitor's chats
      const chatsResponse = await fetch(`/api/visitors/${visitorId}/chats`);
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json();
        setChats(chatsData.chats || []);
      }

      // Fetch visitor's article views
      const viewsResponse = await fetch(`/api/visitors/${visitorId}/views`);
      if (viewsResponse.ok) {
        const viewsData = await viewsResponse.json();
        setViews(viewsData.views || []);
      }
    } catch (error) {
      console.error('Error fetching visitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [visitorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Visitor Not Found</h1>
            <button
              onClick={() => router.push('/admin/users')}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Visitors
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getLeadScoreBadge = (score: number | null) => {
    if (!score) return null;
    
    const config = {
      High: { bg: 'bg-emerald-100', text: 'text-emerald-800', emoji: '🔥' },
      Medium: { bg: 'bg-amber-100', text: 'text-amber-800', emoji: '⚡' },
      Low: { bg: 'bg-gray-100', text: 'text-gray-800', emoji: '💤' },
    };

    const level = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';
    const style = config[level];

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <span>{style.emoji}</span>
        {level} ({score})
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/users')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Visitors
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.name && user.name !== 'null null' ? user.name : user.email}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {user.source}
                </span>
              </div>
            </div>
            
            <button
              onClick={fetchUserData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Apollo Enrichment Data */}
        {user.apollo_enriched_at && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Enrichment Data
              </h2>
              <span className="text-xs text-gray-500">
                Synced {new Date(user.apollo_enriched_at).toLocaleDateString()}
              </span>
            </div>

            {/* Check if any useful Apollo data exists */}
            {!user.title && !user.headline && !user.linkedin_url && !user.company_name && !user.city ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-1">No enrichment data found</p>
                <p className="text-xs text-gray-500">
                  Apollo.io couldn't find additional information for this visitor
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              {(user.title || user.headline || user.linkedin_url) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h3>
                  <div className="space-y-2">
                    {user.title && (
                      <div className="flex items-start gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Title</p>
                          <p className="text-sm text-gray-900">{user.title}</p>
                        </div>
                      </div>
                    )}
                    {user.headline && (
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Headline</p>
                          <p className="text-sm text-gray-900">{user.headline}</p>
                        </div>
                      </div>
                    )}
                    {user.linkedin_url && (
                      <div className="flex items-start gap-2">
                        <Linkedin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">LinkedIn</p>
                          <a
                            href={user.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            View Profile
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Company Info */}
              {(user.company_name || user.company_industry || user.company_website) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company Information
                  </h3>
                  <div className="space-y-2">
                    {user.company_name && (
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Company</p>
                          <p className="text-sm text-gray-900">{user.company_name}</p>
                        </div>
                      </div>
                    )}
                    {user.company_industry && (
                      <div className="flex items-start gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Industry</p>
                          <p className="text-sm text-gray-900">{user.company_industry}</p>
                        </div>
                      </div>
                    )}
                    {user.company_website && (
                      <div className="flex items-start gap-2">
                        <Globe className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Website</p>
                          <a
                            href={user.company_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {user.company_website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location Info */}
              {(user.city || user.state || user.country) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {[user.city, user.state, user.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Total Chats</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{chats.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Article Views</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{views.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Last Active</h3>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {user.last_active_at 
                ? new Date(user.last_active_at).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chats Section */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat History
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {chats.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-600">
                  No chats found
                </div>
              ) : (
                chats.map((chat) => (
                  <div key={chat.id}>
                    <div
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggleChat(chat.chat_id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          <button className="text-gray-400 hover:text-gray-600 mt-0.5 cursor-pointer">
                            {expandedChats.has(chat.chat_id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {chat.topic_summary || 'No summary available'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(chat.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {chat.leadScore && (
                          <div className="ml-2">
                            {getLeadScoreBadge(chat.leadScore)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 ml-6">
                        <span>{chat.message_count} messages</span>
                        {chat.sentiment && (
                          <span className="capitalize">{chat.sentiment} sentiment</span>
                        )}
                      </div>
                    </div>

                    {/* Expanded Chat Transcript */}
                    {expandedChats.has(chat.chat_id) && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-700 mb-3">Chat Transcript</h4>

                        {loadingMessages.has(chat.chat_id) ? (
                          <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                          </div>
                        ) : chatMessages[chat.chat_id]?.length > 0 ? (
                          <div className="space-y-3">
                            {chatMessages[chat.chat_id].map((message, idx) => (
                              <div key={message.id || idx} className="flex gap-2">
                                <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
                                  message.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-800 text-white'
                                }`}>
                                  {message.role === 'user' ? (
                                    <User className="h-3.5 w-3.5" />
                                  ) : (
                                    <Bot className="h-3.5 w-3.5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-medium text-gray-900">
                                      {message.role === 'user' ? 'User' : 'Assistant'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(message.created_at).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div className="rounded-lg px-3 py-2 text-xs bg-white border border-gray-200">
                                    <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 text-center py-6">No messages found for this chat.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Article Views Section */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Article Views
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {views.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-600">
                  No article views found
                </div>
              ) : (
                views.map((view) => (
                  <div key={view.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {view.article_name || view.article_id}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      {view.article_type && (
                        <span className="capitalize">{view.article_type}</span>
                      )}
                      <span>{new Date(view.viewed_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

