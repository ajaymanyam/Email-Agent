import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppShell } from '@/components/AppShell';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { copilotApi } from '@/services/copilotApi';
import { AiDraft, ScheduledEmail, NLSearchResult } from '@/types/copilot';
import {
  Bot,
  Sparkles,
  Send,
  Clock,
  CheckCircle2,
  Trash2,
  Edit3,
  Search,
  Zap,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Mail,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CopilotPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<AiDraft[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingDrafts, setIsGeneratingDrafts] = useState(false);

  // NL Search States
  const [nlQuery, setNlQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<NLSearchResult | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'drafts' | 'scheduled' | 'nlSearch'>('drafts');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [draftsData, scheduledData] = await Promise.all([
        copilotApi.getDrafts(),
        copilotApi.getScheduled(),
      ]);
      setDrafts(draftsData);
      setScheduled(scheduledData);
    } catch {
      toast.error('Failed to load Copilot data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateDrafts = async () => {
    setIsGeneratingDrafts(true);
    try {
      toast.loading('Analyzing inbox & drafting AI replies...', { id: 'gen-draft-toast' });
      const res = await copilotApi.generateDrafts();
      setDrafts(res.drafts);
      toast.success(
        res.createdCount > 0
          ? `Generated ${res.createdCount} new AI draft replies!`
          : 'Ready! All recent emails are up to date.',
        { id: 'gen-draft-toast' }
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate drafts.', {
        id: 'gen-draft-toast',
      });
    } finally {
      setIsGeneratingDrafts(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadData();
      toast.success('AI Copilot refreshed!');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAcceptDraft = async (draft: AiDraft) => {
    try {
      toast.loading('Dispatching AI draft...', { id: 'draft-toast' });
      await copilotApi.acceptDraft(draft._id);
      setDrafts(drafts.filter((d) => d._id !== draft._id));
      toast.success('Email dispatched successfully via Gmail!', { id: 'draft-toast' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch draft.', {
        id: 'draft-toast',
      });
    }
  };

  const handleDiscardDraft = async (id: string) => {
    try {
      await copilotApi.discardDraft(id);
      setDrafts(drafts.filter((d) => d._id !== id));
      toast.success('Draft dismissed.');
    } catch {
      toast.error('Failed to dismiss draft.');
    }
  };

  const handleCancelScheduled = async (id: string) => {
    try {
      await copilotApi.cancelScheduled(id);
      setScheduled(scheduled.filter((s) => s._id !== id));
      toast.success('Scheduled delivery cancelled.');
    } catch {
      toast.error('Failed to cancel scheduled email.');
    }
  };

  const handleNlSearch = async (queryText?: string) => {
    const q = queryText || nlQuery;
    if (!q.trim()) return;

    setIsSearching(true);
    try {
      const result = await copilotApi.naturalLanguageSearch(q);
      setSearchResult(result);
    } catch {
      toast.error('Failed to perform AI natural language search.');
    } finally {
      setIsSearching(false);
    }
  };

  const hoursSaved = (drafts.length * 0.25 + 3.5).toFixed(1);

  return (
    <AppShell onRefresh={handleRefresh} isRefreshing={isRefreshing}>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/30 border border-purple-500/20 backdrop-blur-xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-semibold">
                <Bot className="w-3.5 h-3.5" />
                <span>Autonomous AI Agent Mode</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                AI Copilot Command Center
              </h1>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Your intelligent agent generates draft replies for incoming priority messages in the background, manages scheduled deliveries, and understands natural language search.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-xl font-black text-purple-400">{drafts.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Ready Auto-Drafts</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-xl font-black text-emerald-400">{hoursSaved} hrs</div>
                  <div className="text-[11px] text-slate-400 font-medium">Time Saved</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleGenerateDrafts}
                  disabled={isGeneratingDrafts}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/25 active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingDrafts ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingDrafts ? 'Drafting Replies...' : '⚡ Generate AI Drafts'}</span>
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 ${
              activeTab === 'drafts'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Auto-Drafts ({drafts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 ${
              activeTab === 'scheduled'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled Outbox ({scheduled.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('nlSearch')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-2 ${
              activeTab === 'nlSearch'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Conversational Search</span>
          </button>
        </div>

        {/* TAB 1: AI Auto-Drafts Stream */}
        {activeTab === 'drafts' && (
          <div className="space-y-4">
            {isLoading ? (
              <LoadingSkeleton count={3} />
            ) : drafts.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No Auto-Drafts Yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Click the button below to have Gemini AI analyze your latest emails and generate ready-to-send responses for your review!
                  </p>
                </div>
                <button
                  onClick={handleGenerateDrafts}
                  disabled={isGeneratingDrafts}
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition inline-flex items-center space-x-2 shadow-lg shadow-purple-600/25"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingDrafts ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingDrafts ? 'Generating AI Drafts...' : '⚡ Generate AI Drafts for Recent Emails'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drafts.map((draft) => (
                  <div
                    key={draft._id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/40 transition shadow-lg space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                          Suggested Reply • {draft.tone}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(draft.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">
                          To:{' '}
                          <strong className="text-slate-200">
                            {draft.recipientName || draft.recipientEmail}
                          </strong>
                        </div>
                        <div className="text-sm font-semibold text-white mt-0.5 truncate">
                          {draft.suggestedSubject}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap font-sans">
                        {draft.suggestedBody}
                      </div>

                      {draft.keyPointsCovered?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {draft.keyPointsCovered.map((pt, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 font-medium"
                            >
                              ✓ {pt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                      <button
                        onClick={() => handleDiscardDraft(draft._id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition text-xs"
                        title="Dismiss Draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            router.push(
                              `/compose?to=${encodeURIComponent(
                                draft.recipientEmail
                              )}&subject=${encodeURIComponent(
                                draft.suggestedSubject
                              )}&body=${encodeURIComponent(draft.suggestedBody)}`
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition flex items-center space-x-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Tweak</span>
                        </button>

                        <button
                          onClick={() => handleAcceptDraft(draft)}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-md shadow-purple-600/20 active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Approve & Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Scheduled Send Outbox */}
        {activeTab === 'scheduled' && (
          <div className="space-y-4">
            {scheduled.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No scheduled emails</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    You can schedule any message from the email composer to be automatically dispatched at the exact right moment.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/compose')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition inline-flex items-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Compose & Schedule</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduled.map((item) => (
                  <div
                    key={item._id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                          Scheduled for {new Date(item.scheduledFor).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{item.subject}</h4>
                      <p className="text-xs text-slate-400">
                        To: <span className="text-slate-200">{item.to.join(', ')}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleCancelScheduled(item._id)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 font-semibold text-xs transition flex items-center space-x-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Delivery</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Conversational Search */}
        {activeTab === 'nlSearch' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Conversational Semantic Search</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNlSearch()}
                  placeholder="e.g. Find all sponsorship emails sent last week..."
                  className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
                <button
                  onClick={() => handleNlSearch()}
                  disabled={isSearching}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>{isSearching ? 'Searching...' : 'Search'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] text-slate-500">Try asking:</span>
                {[
                  'Emails with urgent deadlines',
                  'Find follow-up requests',
                  'Sponsorship and MUN proposals',
                  'Unread messages from this week',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNlQuery(sample);
                      handleNlSearch(sample);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            {searchResult && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                  <span>
                    <strong>Interpreted Filter:</strong>{' '}
                    {searchResult.interpretedQuery.explanation || 'Keyword filter applied'}
                  </span>
                  <span className="font-bold">{searchResult.total} matches found</span>
                </div>

                {searchResult.emails.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                    No emails matched your conversational search query.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {searchResult.emails.map((email) => (
                      <div
                        key={email._id}
                        onClick={() => router.push(`/emails/${email._id}`)}
                        className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1.5 truncate flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-xs font-bold text-white truncate">
                              {email.subject || '(No Subject)'}
                            </span>
                            {email.priorityScore && email.priorityScore >= 70 && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
                                Priority {email.priorityScore}%
                              </span>
                            )}
                            {email.isStarred && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                                Starred
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-400 truncate flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-300">
                              {email.from.name || email.from.email}
                            </span>
                            <span>•</span>
                            <span className="truncate text-slate-400">{email.snippet}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0 text-xs text-slate-400">
                          <span className="text-[11px] font-mono">
                            {new Date(email.date).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <div className="p-2 rounded-xl bg-slate-950 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 transition">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
