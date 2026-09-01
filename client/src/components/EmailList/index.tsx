import React, { useEffect } from 'react';
import { useEmailStore } from '@/store/emailStore';
import { useAccountStore } from '@/store/accountStore';
import { EmailRow } from '../EmailRow';
import { LoadingSkeleton } from '../LoadingSkeleton';
import { EmptyState } from '../EmptyState';
import {
  RefreshCw,
  Inbox,
  Star,
  Bookmark,
  Send,
  FileEdit,
  Trash2,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const EmailList: React.FC = () => {
  const {
    emails,
    total,
    page,
    limit,
    totalPages,
    activeView,
    searchQuery,
    isLoading,
    isSyncing,
    fetchEmails,
    syncInbox,
    setActiveView,
  } = useEmailStore();

  const { activeAccount, accounts } = useAccountStore();

  useEffect(() => {
    fetchEmails({
      accountId: activeAccount?._id || 'all',
      view: activeView,
    });
  }, [activeAccount, activeView]);

  const handleSync = async () => {
    try {
      const count = await syncInbox(activeAccount?._id);
      toast.success(
        count > 0
          ? `Synchronized ${count} new email${count === 1 ? '' : 's'} from Gmail!`
          : 'Inbox is up to date!'
      );
    } catch (err: any) {
      toast.error('Failed to sync emails from Gmail.');
    }
  };

  const getEmptyStateConfig = () => {
    if (searchQuery) {
      return {
        title: 'No results found',
        description: `No emails match your search query "${searchQuery}".`,
      };
    }

    switch (activeView) {
      case 'starred':
        return {
          icon: Star,
          title: 'No starred emails',
          description: 'Star important emails to quickly find them here.',
        };
      case 'important':
        return {
          icon: Bookmark,
          title: 'No important emails',
          description: 'Emails marked as important will appear here.',
        };
      case 'sent':
        return {
          icon: Send,
          title: 'No sent emails',
          description: 'Emails you send will appear in this folder.',
        };
      case 'drafts':
        return {
          icon: FileEdit,
          title: 'No drafts saved',
          description: 'Draft messages you write will be saved here.',
        };
      case 'trash':
        return {
          icon: Trash2,
          title: 'Trash is empty',
          description: 'Deleted emails will stay here for 30 days before being permanently removed.',
        };
      case 'spam':
        return {
          icon: AlertOctagon,
          title: 'Spam is empty',
          description: 'Hooray! No spam messages detected.',
        };
      case 'priority':
        return {
          icon: Sparkles,
          title: 'No high-priority emails',
          description: 'AI-prioritized urgent emails will appear here automatically.',
        };
      case 'inbox':
      default:
        return {
          icon: Inbox,
          title: 'Your inbox is empty',
          description:
            accounts.length === 0
              ? 'Connect your Gmail account in the Accounts tab to start receiving emails.'
              : 'Click Synchronize to pull your latest emails from Gmail.',
          actionText: accounts.length > 0 ? 'Sync with Gmail' : undefined,
          onAction: accounts.length > 0 ? handleSync : undefined,
        };
    }
  };

  const emptyConfig = getEmptyStateConfig();
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(total, page * limit);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/40 backdrop-blur-md rounded-2xl border border-slate-800/60 overflow-hidden shadow-xl">
      {/* List Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        {/* Left: View Title & Sync Button */}
        <div className="flex items-center space-x-3">
          <h2 className="text-sm font-bold text-white capitalize tracking-wide">
            {activeView.replace('-', ' ')}
          </h2>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50 flex items-center space-x-1.5 text-xs font-medium"
            title="Synchronize emails with Gmail"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>

        {/* Right: Pagination Controls */}
        <div className="flex items-center space-x-3 text-xs text-slate-400 font-medium">
          <span>
            {startItem}-{endItem} of {total}
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => fetchEmails({ page: page - 1 })}
              disabled={page <= 1 || isLoading}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchEmails({ page: page + 1 })}
              disabled={page >= totalPages || isLoading}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Email List Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {isLoading && emails.length === 0 ? (
          <div className="p-4">
            <LoadingSkeleton count={6} type="email-row" />
          </div>
        ) : emails.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={emptyConfig.icon}
              title={emptyConfig.title}
              description={emptyConfig.description}
              actionText={emptyConfig.actionText}
              onAction={emptyConfig.onAction}
            />
          </div>
        ) : (
          emails.map((email) => <EmailRow key={email._id} email={email} />)
        )}
      </div>
    </div>
  );
};

export default EmailList;
