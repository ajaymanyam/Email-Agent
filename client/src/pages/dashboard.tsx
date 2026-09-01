import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppShell } from '@/components/AppShell';
import { EmailList } from '@/components/EmailList';
import { useAuthStore } from '@/store/authStore';
import { useAccountStore } from '@/store/accountStore';
import { useEmailStore } from '@/store/emailStore';
import {
  Sparkles,
  Inbox,
  ShieldCheck,
  Zap,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { accounts, activeAccount, fetchAccounts } = useAccountStore();
  const { emails, total, activeView, setActiveView, syncInbox, isSyncing } = useEmailStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    const view = (router.query.view as string) || 'inbox';
    setActiveView(view);
  }, [router.query.view]);

  const connectedAccountsCount = accounts.filter((a) => a.isConnected).length;
  const unreadCount = emails.filter((e) => !e.isRead).length;
  const highPriorityCount = emails.filter((e) => e.priorityScore && e.priorityScore >= 70).length;

  const handleManualSync = async () => {
    if (connectedAccountsCount === 0) {
      router.push('/accounts');
      return;
    }

    try {
      setIsRefreshing(true);
      const count = await syncInbox(activeAccount?._id);
      toast.success(
        count > 0
          ? `Synced ${count} email${count === 1 ? '' : 's'} from Gmail!`
          : 'Inbox is already up to date!'
      );
    } catch (err) {
      toast.error('Failed to sync emails from Gmail.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <AppShell onRefresh={handleManualSync} isRefreshing={isRefreshing || isSyncing}>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Welcome & AI Summary Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/30 border border-blue-500/20 backdrop-blur-xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Intelligent Email Assistant</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome back, {user?.name || 'there'}!
              </h1>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                {connectedAccountsCount > 0
                  ? `Connected to ${activeAccount?.email || 'Gmail'}. Your messages and conversation threads are synchronized with AI processing.`
                  : 'Connect your Gmail or Outlook account to unlock automated AI thread summaries, priority ranking, and smart compose.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {connectedAccountsCount > 0 ? (
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing || isRefreshing}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 shadow-lg transition duration-150 flex items-center space-x-2 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Inbox'}</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/accounts')}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition duration-200 flex items-center space-x-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Connect Email Account</span>
                </button>
              )}

              <button
                onClick={() => router.push('/compose')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition duration-200 flex items-center space-x-2 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Compose</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Setup Banner (if no accounts connected) */}
        {connectedAccountsCount === 0 && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Connect your Gmail account
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authorize your Gmail account to pull your emails and start receiving AI insights.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/accounts')}
              className="px-4 py-2 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition flex items-center space-x-1.5 shrink-0"
            >
              <span>Connect Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveView('inbox')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              activeView === 'inbox'
                ? 'bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-500/10'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Inbox Total</span>
              <Inbox className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{total}</div>
            <p className="text-[11px] text-slate-400 mt-1">Total synchronized messages</p>
          </div>

          <div
            onClick={() => setActiveView('unread')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              activeView === 'unread'
                ? 'bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-500/10'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Unread</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
            </div>
            <div className="text-2xl font-bold text-white">{unreadCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting your review</p>
          </div>

          <div
            onClick={() => setActiveView('priority')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              activeView === 'priority'
                ? 'bg-purple-950/40 border-purple-500/50 shadow-md shadow-purple-500/10'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">AI Priority</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{highPriorityCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">High urgency emails</p>
          </div>

          <div
            onClick={() => setActiveView('starred')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              activeView === 'starred'
                ? 'bg-amber-950/40 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Starred</span>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {emails.filter((e) => e.isStarred).length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Flagged for reference</p>
          </div>
        </div>

        {/* Main Email Inbox Panel */}
        <div className="h-[620px] flex flex-col">
          <EmailList />
        </div>
      </div>
    </AppShell>
  );
}
