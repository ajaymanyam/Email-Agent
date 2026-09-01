import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { AccountSwitcher } from '../AccountSwitcher';
import {
  Search,
  Sparkles,
  RefreshCw,
  Bell,
  User as UserIcon,
  LogOut,
  Settings,
  ChevronDown,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TopBarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onRefresh, isRefreshing = false }) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSmartSearch, setIsSmartSearch] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push({
      pathname: '/dashboard',
      query: { q: searchQuery, smart: isSmartSearch ? 'true' : 'false' },
    });
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <header className="h-16 px-6 border-b border-slate-800/80 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between z-20">
      {/* Left: Search Bar */}
      <div className="flex-1 max-w-2xl">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <div className="relative w-full flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isSmartSearch
                  ? 'AI Search: "Find urgent invoices from this month..."'
                  : 'Search sender, subject, keywords, labels...'
              }
              className={`w-full pl-10 pr-28 py-2 text-sm rounded-xl bg-slate-900/90 text-slate-100 placeholder-slate-400 border transition-all focus:outline-none focus:ring-2 ${
                isSmartSearch
                  ? 'border-purple-500/50 focus:border-purple-400 focus:ring-purple-500/20'
                  : 'border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20'
              }`}
            />
            {/* AI Smart Search Toggle */}
            <button
              type="button"
              onClick={() => setIsSmartSearch(!isSmartSearch)}
              className={`absolute right-2 px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                isSmartSearch
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
              }`}
              title="Toggle AI Smart Natural Language Search"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSmartSearch ? 'animate-pulse text-amber-300' : ''}`} />
              <span>AI Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4 ml-6">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition disabled:opacity-50"
          title="Refresh Inbox"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#1e293b] border border-slate-700/80 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <span className="font-semibold text-sm text-slate-200">Notifications</span>
                <span className="text-xs text-blue-400 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="py-4 text-center">
                <p className="text-xs text-slate-400">All notifications caught up</p>
              </div>
            </div>
          )}
        </div>

        {/* Connected Accounts Switcher */}
        <AccountSwitcher />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user?.name ? user.name.charAt(0) : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate">
              {user?.name || 'User'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#1e293b] border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-700/80 mb-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  router.push('/settings');
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings & Preferences</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
