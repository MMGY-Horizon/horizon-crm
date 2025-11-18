"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  MapPin,
  Settings,
  UsersRound,
  Search,
  Sparkles,
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Chats', href: '/admin/chats', icon: MessageSquare },
  { name: 'Places', href: '/admin/places', icon: MapPin },
  { name: 'Visitors', href: '/admin/users', icon: Users },
  { name: 'Team', href: '/admin/team', icon: UsersRound },
  { name: 'Crawler', href: '/admin/crawler', icon: Search },
];

const bottomNavigation = [
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Horizon CRM</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 px-3 py-4">
        <div className="space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Profile */}
      {session?.user && (
        <div className="border-t border-gray-200 px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name || ''}
                className="h-8 w-8 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors mt-2 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

