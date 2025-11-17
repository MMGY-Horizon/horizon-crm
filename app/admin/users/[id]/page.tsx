"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Eye, Mail, Calendar, RefreshCw } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface Visitor {
  id: string;
  email: string;
  name: string | null;
  source: string;
  created_at: string;
  last_active_at: string | null;
}

interface Chat {
  id: string;
  created_at: string;
  message_count: number;
  topic_summary: string | null;
  leadScore: number | null;
  sentiment: string | null;
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

  const visitorId = params.id as string;

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
                {user.name || user.email}
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
                  <div key={chat.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {chat.topic_summary || 'No summary available'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(chat.created_at).toLocaleString()}
                        </p>
                      </div>
                      {chat.leadScore && (
                        <div className="ml-2">
                          {getLeadScoreBadge(chat.leadScore)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>{chat.message_count} messages</span>
                      {chat.sentiment && (
                        <span className="capitalize">{chat.sentiment} sentiment</span>
                      )}
                    </div>
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

