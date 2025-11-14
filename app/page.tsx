import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-8">
      <div className="max-w-4xl text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Horizon CRM
        </h1>
        <p className="text-2xl text-gray-600 mb-12">
          Modern Customer Relationship Management & Analytics Platform
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            href="/admin"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
          >
            <div className="relative z-10">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h2>
              <p className="text-gray-600 mb-4">
                View analytics, user metrics, and system insights
              </p>
              <div className="flex items-center justify-center text-blue-600 font-semibold">
                Enter Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg border border-gray-200 opacity-60">
            <div className="relative z-10">
              <div className="text-4xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                CRM Portal
              </h2>
              <p className="text-gray-600 mb-4">
                Manage contacts, leads, and customer relationships
              </p>
              <div className="flex items-center justify-center text-gray-400 font-semibold">
                Coming Soon
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          Built with Next.js 16, TypeScript, and Tailwind CSS
        </div>
      </div>
    </div>
  );
}
