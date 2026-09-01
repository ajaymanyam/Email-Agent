import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppShell } from '@/components/AppShell';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useEmailStore } from '@/store/emailStore';
import { emailApi } from '@/services/emailApi';
import { aiApi, AISummaryData, AIExplainData, AISecurityData, AIActionItem } from '@/services/aiApi';
import { EmailThread, EmailMessage } from '@/types/email';
import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  Sparkles,
  Paperclip,
  ShieldCheck,
  ShieldAlert,
  Bot,
  CheckSquare,
  HelpCircle,
  Wand2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  FileDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sanitizeHtml } from '@/utils/sanitize';

export default function EmailDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toggleStar, archiveEmail, trashEmail } = useEmailStore();

  const [thread, setThread] = useState<EmailThread | null>(null);
  const [singleEmail, setSingleEmail] = useState<EmailMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // AI Feature States
  const [summaryData, setSummaryData] = useState<AISummaryData | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [explainData, setExplainData] = useState<AIExplainData | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const [securityData, setSecurityData] = useState<AISecurityData | null>(null);
  const [isCheckingSecurity, setIsCheckingSecurity] = useState(false);

  const [actionItems, setActionItems] = useState<AIActionItem[]>([]);
  const [isExtractingActions, setIsExtractingActions] = useState(false);

  const [replyTone, setReplyTone] = useState('Professional');
  const [suggestedReplies, setSuggestedReplies] = useState<Array<{ tone: string; text: string }>>([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const threadData = await emailApi.getThread(id);
        setThread(threadData);
      } catch {
        try {
          const emailData = await emailApi.getEmail(id);
          setSingleEmail(emailData);
        } catch {
          toast.error('Failed to load email thread.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const messages: EmailMessage[] = thread?.messages || (singleEmail ? [singleEmail] : []);
  const latestMessage = messages[messages.length - 1];
  const subject = thread?.subject || singleEmail?.subject || '(No Subject)';
  const isStarred = thread?.isStarred ?? singleEmail?.isStarred ?? false;

  const getCombinedText = () => {
    return messages.map((m) => `${m.from?.name || m.from?.email}: ${m.bodyText || m.snippet}`).join('\n\n');
  };

  // AI Handler: Summarize
  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const data = await aiApi.summarize(getCombinedText(), subject);
      setSummaryData(data);
      toast.success('AI summary generated!');
    } catch {
      toast.error('Failed to generate summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // AI Handler: Explain in Simple Terms
  const handleExplain = async () => {
    setIsExplaining(true);
    try {
      const data = await aiApi.explain(latestMessage?.bodyText || getCombinedText());
      setExplainData(data);
      toast.success('Explanation ready!');
    } catch {
      toast.error('Failed to explain email.');
    } finally {
      setIsExplaining(false);
    }
  };

  // AI Handler: Generate Replies
  const handleGenerateReplies = async (tone = replyTone) => {
    setIsGeneratingReplies(true);
    setReplyTone(tone);
    try {
      const data = await aiApi.generateReply(getCombinedText(), tone);
      setSuggestedReplies(data.replies);
      toast.success('Smart replies ready!');
    } catch {
      toast.error('Failed to generate replies.');
    } finally {
      setIsGeneratingReplies(false);
    }
  };

  // AI Handler: Phishing / Security Check
  const handleSecurityCheck = async () => {
    if (!latestMessage) return;
    setIsCheckingSecurity(true);
    try {
      const data = await aiApi.securityCheck({
        sender: latestMessage.from?.email || '',
        subject,
        body: latestMessage.bodyText || latestMessage.snippet,
      });
      setSecurityData(data);
      toast.success('Security check complete!');
    } catch {
      toast.error('Failed to run security analysis.');
    } finally {
      setIsCheckingSecurity(false);
    }
  };

  // AI Handler: Extract Actions
  const handleExtractActions = async () => {
    setIsExtractingActions(true);
    try {
      const items = await aiApi.extractActions(getCombinedText());
      setActionItems(items);
      toast.success(`Extracted ${items.length} action item(s)!`);
    } catch {
      toast.error('Failed to extract action items.');
    } finally {
      setIsExtractingActions(false);
    }
  };

  const handleToggleStar = async () => {
    if (!latestMessage) return;
    await toggleStar(latestMessage._id);
    if (thread) setThread({ ...thread, isStarred: !thread.isStarred });
    if (singleEmail) setSingleEmail({ ...singleEmail, isStarred: !singleEmail.isStarred });
  };

  const handleArchive = async () => {
    if (!latestMessage) return;
    try {
      await archiveEmail(latestMessage._id);
      toast.success('Email archived.');
      router.push('/dashboard');
    } catch {
      toast.error('Failed to archive email.');
    }
  };

  const handleTrash = async () => {
    if (!latestMessage) return;
    try {
      await trashEmail(latestMessage._id);
      toast.success('Email moved to trash.');
      router.push('/dashboard');
    } catch {
      toast.error('Failed to move email to trash.');
    }
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Navigation Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mailbox</span>
          </button>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleToggleStar}
              className={`p-2 rounded-xl border transition ${
                isStarred
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-800'
              }`}
              title={isStarred ? 'Unstar' : 'Star'}
            >
              <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={async () => {
                const targetThreadId = thread?.threadId || singleEmail?.providerThreadId || (typeof id === 'string' ? id : undefined);
                if (!targetThreadId) return;
                try {
                  toast.loading('Exporting thread (.EML)...', { id: 'export-toast' });
                  await emailApi.exportThread(targetThreadId, 'eml');
                  toast.success('Thread exported (.EML) successfully!', { id: 'export-toast' });
                } catch {
                  toast.error('Failed to export thread.', { id: 'export-toast' });
                }
              }}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition flex items-center space-x-1 text-xs"
              title="Export Thread (.EML)"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Export</span>
            </button>

            <button
              onClick={handleArchive}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>

            <button
              onClick={handleTrash}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Move to Trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (latestMessage?.from?.email) {
                  router.push(
                    `/compose?to=${encodeURIComponent(latestMessage.from.email)}&subject=${encodeURIComponent(
                      'Re: ' + subject
                    )}`
                  );
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-md shadow-blue-600/20"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton type="thread" count={2} />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p>No messages found in this conversation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns: Email Thread Messages */}
            <div className="lg:col-span-2 space-y-4">
              {/* Thread Subject Title */}
              <div className="px-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {subject}
                </h1>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {messages.length} message{messages.length === 1 ? '' : 's'}
                  </span>
                  {latestMessage?.labels && latestMessage.labels.length > 0 && (
                    <span className="text-xs text-slate-500">
                      Labels: {latestMessage.labels.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages in Conversation */}
              {messages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className="rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl overflow-hidden"
                >
                  {/* Sender & Recipient Header */}
                  <div className="p-5 border-b border-slate-800/60 bg-slate-950/40 flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0 uppercase">
                        {(msg.from?.name || msg.from?.email || 'U').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-white">
                            {msg.from?.name || msg.from?.email?.split('@')[0]}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            &lt;{msg.from?.email}&gt;
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          To:{' '}
                          {msg.to?.map((t: any) => t.name || t.email).join(', ') || 'Me'}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 font-medium shrink-0">
                      {formatDate(msg.date)}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="p-6">
                    {msg.bodyHtml ? (
                      <div
                        className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.bodyHtml) }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed font-sans">
                        {msg.bodyText || msg.snippet}
                      </div>
                    )}

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
                        <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{msg.attachments.length} Attachment{msg.attachments.length === 1 ? '' : 's'}</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.attachments.map((att: any) => (
                            <div
                              key={att.attachmentId}
                              className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 flex items-center space-x-2"
                            >
                              <Paperclip className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-xs">{att.filename}</span>
                              <span className="text-[10px] text-slate-400">
                                ({Math.round(att.size / 1024)} KB)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Interactive AI Assistant Intelligence Suite */}
            <div className="space-y-4 sticky top-6">
              {/* AI Assistant Hub Header Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-purple-950/40 via-slate-900/80 to-slate-900/80 border border-purple-500/20 backdrop-blur-xl shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Assistant Suite</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Online
                  </span>
                </div>

                {/* Quick Trigger Action Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/30 text-slate-200 transition text-left flex items-center space-x-1.5 font-medium disabled:opacity-50"
                  >
                    {isSummarizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                    <span>Summarize</span>
                  </button>

                  <button
                    onClick={handleExplain}
                    disabled={isExplaining}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 text-slate-200 transition text-left flex items-center space-x-1.5 font-medium disabled:opacity-50"
                  >
                    {isExplaining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HelpCircle className="w-3.5 h-3.5 text-blue-400" />}
                    <span>Explain</span>
                  </button>

                  <button
                    onClick={() => handleGenerateReplies(replyTone)}
                    disabled={isGeneratingReplies}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 text-slate-200 transition text-left flex items-center space-x-1.5 font-medium disabled:opacity-50"
                  >
                    {isGeneratingReplies ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>Smart Reply</span>
                  </button>

                  <button
                    onClick={handleSecurityCheck}
                    disabled={isCheckingSecurity}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/30 text-slate-200 transition text-left flex items-center space-x-1.5 font-medium disabled:opacity-50"
                  >
                    {isCheckingSecurity ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />}
                    <span>Phishing Check</span>
                  </button>
                </div>
              </div>

              {/* AI Summarization Results Card */}
              {summaryData && (
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-xl shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">Executive Summary</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        summaryData.urgencyScore >= 70
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      Urgency: {summaryData.urgencyScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {summaryData.executiveSummary}
                  </p>
                  {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
                    <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc">
                      {summaryData.keyPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* AI "Explain in Simple Terms" Card */}
              {explainData && (
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-blue-500/30 backdrop-blur-xl shadow-xl space-y-3">
                  <span className="text-xs font-bold text-blue-300">Simplified Explanation</span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {explainData.simplifiedExplanation}
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950/60 text-xs text-blue-200 border border-blue-500/20 space-y-1">
                    <strong>Bottom Line:</strong> {explainData.bottomLine}
                  </div>
                </div>
              )}

              {/* AI Smart Replies Card */}
              {suggestedReplies.length > 0 && (
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">AI Suggested Replies</span>
                    <div className="flex space-x-1">
                      {['Professional', 'Friendly', 'Concise'].map((t) => (
                        <button
                          key={t}
                          onClick={() => handleGenerateReplies(t)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                            replyTone === t
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {suggestedReplies.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 space-y-2 transition"
                      >
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">
                          {r.tone}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                          {r.text}
                        </p>
                        <button
                          onClick={() => {
                            if (latestMessage?.from?.email) {
                              router.push(
                                `/compose?to=${encodeURIComponent(
                                  latestMessage.from.email
                                )}&subject=${encodeURIComponent('Re: ' + subject)}&body=${encodeURIComponent(
                                  r.text
                                )}`
                              );
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-[11px] font-semibold transition flex items-center space-x-1"
                        >
                          <Reply className="w-3 h-3" />
                          <span>Use in Composer</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Security & Phishing Card */}
              {securityData && (
                <div
                  className={`p-5 rounded-3xl backdrop-blur-xl shadow-xl space-y-3 border ${
                    securityData.riskScore > 50
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : 'bg-emerald-950/30 border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                      {securityData.riskScore > 50 ? (
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                      <span>Security Analysis</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        securityData.riskScore > 50
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500 text-slate-950'
                      }`}
                    >
                      {securityData.riskLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium">
                    {securityData.recommendedAction}
                  </p>

                  {securityData.warningReasons && (
                    <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                      {securityData.warningReasons.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
