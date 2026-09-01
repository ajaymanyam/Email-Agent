import React from 'react';
import Link from 'next/router';
import { useRouter } from 'next/router';
import { useUIStore } from '@/store/uiStore';
import {
  Inbox,
  Star,
  Bookmark,
  Send,
  FileEdit,
  Archive,
  AlertOctagon,
  Trash2,
  Sparkles,
  CheckSquare,
  FileText,
  BarChart3,
  History,
  Settings,
  Mail,
  PlusCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bot,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, setComposeOpen } = useUIStore();

  const mainNav = [
    { name: 'Inbox', href: '/dashboard', icon: Inbox, badge: undefined },
    { name: 'AI Priority', href: '/dashboard?view=priority', icon: Sparkles, badge: 'AI' },
    { name: 'Starred', href: '/dashboard?view=starred', icon: Star },
    { name: 'Important', href: '/dashboard?view=important', icon: Bookmark },
    { name: 'Sent', href: '/dashboard?view=sent', icon: Send },
    { name: 'Drafts', href: '/dashboard?view=drafts', icon: FileEdit },
    { name: 'Archived', href: '/dashboard?view=archived', icon: Archive },
    { name: 'Spam', href: '/dashboard?view=spam', icon: AlertOctagon },
    { name: 'Trash', href: '/dashboard?view=trash', icon: Trash2 },
  ];

  const toolsNav = [
    { name: 'AI Copilot', href: '/copilot', icon: Bot, badge: 'Agent' },
    { name: 'Action Items', href: '/action-items', icon: CheckSquare },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Smart Rules', href: '/rules', icon: Zap },
    { name: 'Accounts', href: '/accounts', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && router.pathname === '/dashboard' && !router.query.view) {
      return true;
    }
    if (href.includes('?view=') && router.asPath === href) {
      return true;
    }
    return router.pathname === href;
  };

  return (
    <aside
      className={`relative flex flex-col h-screen border-r border-slate-800/80 bg-[#0f172a]/95 backdrop-blur-xl transition-all duration-300 z-30 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 text-white font-bold shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Email Assistant
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Intelligent AI Client
              </span>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Compose Button */}
      <div className="p-4">
        <button
          onClick={() => {
            setComposeOpen(true);
            if (router.pathname !== '/compose' && router.pathname !== '/dashboard') {
              router.push('/compose');
            }
          }}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition duration-200 active:scale-[0.98] ${
            !sidebarOpen ? 'px-0' : ''
          }`}
        >
          <PlusCircle className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span>Compose</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Email Folders */}
        <div className="space-y-1">
          {sidebarOpen && (
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Mailbox
            </p>
          )}
          {mainNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}
                </div>
                {sidebarOpen && item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* AI & Productivity Tools */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          {sidebarOpen && (
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              AI & Tools
            </p>
          )}
          {toolsNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Account Info Footer */}
      {sidebarOpen && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Online</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">v1.0.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
