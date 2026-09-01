import React from 'react';
import { useRouter } from 'next/router';
import { EmailMessage } from '@/types/email';
import { useEmailStore } from '@/store/emailStore';
import {
  Star,
  Paperclip,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Sparkles,
} from 'lucide-react';

interface EmailRowProps {
  email: EmailMessage;
}

export const EmailRow: React.FC<EmailRowProps> = ({ email }) => {
  const router = useRouter();
  const { toggleStar, markRead, archiveEmail, trashEmail } = useEmailStore();

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const senderName = email.from?.name || email.from?.email?.split('@')[0] || 'Unknown';
  const avatarLetter = senderName.charAt(0).toUpperCase();

  const handleRowClick = () => {
    if (!email.isRead) {
      markRead(email._id, true);
    }
    router.push(`/emails/${email.providerThreadId || email._id}`);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-center px-4 py-3.5 border-b border-slate-800/60 cursor-pointer transition-all duration-150 ${
        !email.isRead
          ? 'bg-slate-900/90 hover:bg-slate-800/80 font-medium'
          : 'bg-transparent hover:bg-slate-900/50 text-slate-300'
      }`}
    >
      {/* Left Column: Read Indicator & Star */}
      <div
        className="flex items-center space-x-3 pr-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Unread indicator */}
        <div className="w-2 h-2 flex items-center justify-center">
          {!email.isRead && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
          )}
        </div>

        {/* Star Button */}
        <button
          onClick={() => toggleStar(email._id)}
          className="p-1 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition"
          title={email.isStarred ? 'Unstar' : 'Star'}
        >
          <Star
            className={`w-4 h-4 transition ${
              email.isStarred
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          />
        </button>
      </div>

      {/* Sender Avatar & Name */}
      <div className="flex items-center space-x-2.5 w-44 shrink-0 truncate">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700/80 flex items-center justify-center text-[11px] font-bold text-slate-200 shrink-0 uppercase">
          {avatarLetter}
        </div>
        <span
          className={`text-xs truncate ${
            !email.isRead ? 'text-white font-semibold' : 'text-slate-300'
          }`}
        >
          {senderName}
        </span>
      </div>

      {/* Subject & Snippet */}
      <div className="flex-1 min-w-0 pr-4 flex items-center space-x-2">
        <span
          className={`text-xs truncate ${
            !email.isRead ? 'text-slate-100 font-semibold' : 'text-slate-300'
          }`}
        >
          {email.subject || '(No Subject)'}
        </span>
        <span className="text-slate-500 text-xs truncate font-normal">
          — {email.snippet || ''}
        </span>
      </div>

      {/* Badges / Attachments */}
      <div className="flex items-center space-x-2 shrink-0 pr-2">
        {email.priorityScore !== undefined && email.priorityScore >= 70 && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>High Priority</span>
          </span>
        )}

        {email.attachments && email.attachments.length > 0 && (
          <Paperclip className="w-3.5 h-3.5 text-slate-500" />
        )}
      </div>

      {/* Date / Quick Actions */}
      <div className="w-28 text-right shrink-0 flex items-center justify-end">
        {/* Timestamp */}
        <span className="text-xs text-slate-400 group-hover:hidden transition font-normal">
          {formatDate(email.date)}
        </span>

        {/* Hover Quick Actions */}
        <div
          className="hidden group-hover:flex items-center space-x-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => markRead(email._id, !email.isRead)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={email.isRead ? 'Mark as unread' : 'Mark as read'}
          >
            {email.isRead ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => archiveEmail(email._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Archive"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => trashEmail(email._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailRow;
