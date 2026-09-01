import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppShell } from '@/components/AppShell';
import { analyticsApi } from '@/services/analyticsApi';
import {
  AnalyticsOverview,
  VolumeDataPoint,
  TopContact,
  ProductivityInsights,
} from '@/types/analytics';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Mail,
  Send,
  Users,
  Sparkles,
  Zap,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  Loader2,
  Activity,
  Layers,
  ArrowDownLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeframeDays, setTimeframeDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [volumeTrends, setVolumeTrends] = useState<VolumeDataPoint[]>([]);
  const [topContacts, setTopContacts] = useState<TopContact[]>([]);
  const [productivity, setProductivity] = useState<ProductivityInsights | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.allSettled([
          analyticsApi.getOverview(timeframeDays),
          analyticsApi.getVolumeTrends(Math.min(timeframeDays, 14)),
          analyticsApi.getTopContacts(6),
          analyticsApi.getProductivity(),
        ]);

        if (results[0].status === 'fulfilled') setOverview(results[0].value);
        if (results[1].status === 'fulfilled') setVolumeTrends(results[1].value);
        if (results[2].status === 'fulfilled') setTopContacts(results[2].value);
        if (results[3].status === 'fulfilled') setProductivity(results[3].value);
      } catch (err: any) {
        console.error('Analytics load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [timeframeDays]);

  // Max volume calculation for bar chart scaling
  const maxDailyVolume = Math.max(
    ...volumeTrends.map((d) => Math.max(d.received, d.sent)),
    5
  );

  const totalPriority =
    (productivity?.priorityDistribution.high || 0) +
    (productivity?.priorityDistribution.medium || 0) +
    (productivity?.priorityDistribution.low || 0);

  const highPct =
    totalPriority > 0
      ? Math.round(((productivity?.priorityDistribution.high || 0) / totalPriority) * 100)
      : 0;
  const medPct =
    totalPriority > 0
      ? Math.round(((productivity?.priorityDistribution.medium || 0) / totalPriority) * 100)
      : 0;
  const lowPct =
    totalPriority > 0
      ? Math.round(((productivity?.priorityDistribution.low || 0) / totalPriority) * 100)
      : 0;

  return (
    <AppShell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Title & Timeframe Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <span>Email Analytics & Productivity</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time insights into your email velocity, response times, top contacts, and inbox health.
            </p>
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-2xl border border-slate-800/80 text-xs">
            {[
              { label: '7 Days', days: 7 },
              { label: '14 Days', days: 14 },
              { label: '30 Days', days: 30 },
              { label: '90 Days', days: 90 },
            ].map((t) => (
              <button
                key={t.days}
                onClick={() => setTimeframeDays(t.days)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  timeframeDays === t.days
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
            <p className="text-xs font-medium">Computing your email intelligence & productivity metrics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stat Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Traffic */}
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Total Email Traffic</span>
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">{overview?.totalEmails || 0}</div>
                <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <ArrowDownLeft className="w-3 h-3" />
                    <span>{overview?.receivedCount || 0} in</span>
                  </span>
                  <span className="flex items-center space-x-1 text-blue-400">
                    <Send className="w-3 h-3" />
                    <span>{overview?.sentCount || 0} out</span>
                  </span>
                </div>
              </div>

              {/* Average Response Time */}
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Avg Response Time</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-300">
                  {overview?.avgResponseTimeHours ? `${overview.avgResponseTimeHours} hrs` : 'Instant'}
                </div>
                <p className="text-[10px] text-slate-500">Based on recent conversations</p>
              </div>

              {/* Inbox Health Score */}
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Inbox Health Score</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-300">
                  {overview?.inboxHealthScore || 100}
                  <span className="text-xs text-slate-500 font-normal"> / 100</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${overview?.inboxHealthScore || 100}%` }}
                  />
                </div>
              </div>

              {/* Action Item Completion */}
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Task Completion</span>
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-300">
                  {overview?.actionItemCompletionRate || 0}%
                </div>
                <p className="text-[10px] text-slate-500">
                  {overview?.completedActionItems || 0} of {overview?.totalActionItems || 0} action items done
                </p>
              </div>
            </div>

            {/* Charts & Trends Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Volume Trends Chart */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span>Daily Email Volume Trends</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Incoming messages vs. sent emails over the past {volumeTrends.length} days.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-400">Received</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-slate-400">Sent</span>
                    </div>
                  </div>
                </div>

                {/* Bar Chart Visualization */}
                {volumeTrends.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No message history recorded in this timeframe.
                  </div>
                ) : (
                  <div className="pt-6 pb-2">
                    <div className="flex items-end justify-between gap-2 h-40 border-b border-slate-800 px-2">
                      {volumeTrends.map((d) => {
                        const recHeight = Math.max(6, Math.round((d.received / maxDailyVolume) * 120));
                        const sentHeight = Math.max(6, Math.round((d.sent / maxDailyVolume) * 120));
                        const dayLabel = new Date(d.date).toLocaleDateString([], {
                          weekday: 'narrow',
                          day: 'numeric',
                        });

                        return (
                          <div
                            key={d.date}
                            className="flex-1 flex flex-col items-center justify-end h-full group relative"
                          >
                            {/* Hover Tooltip */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-950 border border-slate-800 text-[10px] text-white p-1.5 rounded-lg shadow-xl whitespace-nowrap z-10">
                              {d.date}: {d.received} in, {d.sent} out
                            </div>

                            <div className="flex items-end space-x-1">
                              {/* Received Bar */}
                              <div
                                style={{ height: `${recHeight}px` }}
                                className="w-2 sm:w-3.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                              />
                              {/* Sent Bar */}
                              <div
                                style={{ height: `${sentHeight}px` }}
                                className="w-2 sm:w-3.5 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                              />
                            </div>

                            <span className="text-[9px] text-slate-500 mt-2 font-mono">{dayLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Priority & Urgency Distribution */}
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>AI Urgency Distribution</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    AI classification breakdown of urgency and required attention.
                  </p>
                </div>

                <div className="space-y-3 py-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-rose-300 font-semibold flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>High / Urgent Priority</span>
                      </span>
                      <span className="text-slate-400 font-mono">
                        {productivity?.priorityDistribution.high || 0} ({highPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${highPct}%` }}
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-amber-300 font-semibold flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Medium Priority</span>
                      </span>
                      <span className="text-slate-400 font-mono">
                        {productivity?.priorityDistribution.medium || 0} ({medPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${medPct}%` }}
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-blue-300 font-semibold flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Standard / Informational</span>
                      </span>
                      <span className="text-slate-400 font-mono">
                        {productivity?.priorityDistribution.low || 0} ({lowPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${lowPct}%` }}
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center space-x-1.5 text-purple-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Recommendation:</span>
                  </div>
                  <p>
                    {highPct > 30
                      ? 'You have a high volume of urgent messages. Consider delegating or using fast template replies.'
                      : 'Your inbox flow is balanced. Keep up the steady reply cadence!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Top Correspondents & Contacts */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Top Correspondents & Frequent Senders</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Contacts with the highest interaction frequency across your synchronized emails.
                  </p>
                </div>

                <button
                  onClick={() => router.push('/compose')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-md shadow-blue-600/20"
                >
                  <Send className="w-3 h-3" />
                  <span>Compose Message</span>
                </button>
              </div>

              {topContacts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No contact interactions recorded yet. Synchronize your inbox to populate top contacts!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {topContacts.map((contact) => (
                    <div
                      key={contact.email}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs uppercase shadow-md shrink-0">
                          {contact.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{contact.name}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{contact.email}</p>
                          <span className="text-[10px] text-slate-500">
                            {contact.count} email{contact.count === 1 ? '' : 's'} exchanged
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          router.push(`/compose?to=${encodeURIComponent(contact.email)}`)
                        }
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
                        title="Send email"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
