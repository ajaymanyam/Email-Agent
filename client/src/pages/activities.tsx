import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { AppShell } from '@/components/AppShell';
import {
  History,
  Activity,
  ShieldCheck,
  Mail,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export default function ActivitiesPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>('all');

  const staticActivities = [
    {
      id: 'act-1',
      title: 'Gemini 2.0 Flash AI Analysis',
      description: 'Extracted executive summary, action items, and urgency classification.',
      category: 'ai',
      icon: Sparkles,
      iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      time: '12 minutes ago',
      status: 'success',
    },
    {
      id: 'act-2',
      title: 'Action Item Created',
      description: 'Added task "Review Model United Nations sponsorship deck" to action board.',
      category: 'tasks',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      time: '35 minutes ago',
      status: 'success',
    },
    {
      id: 'act-3',
      title: 'Phishing Shield Verification',
      description: 'Verified sender SPF/DKIM authentication and scanned outbound URLs.',
      category: 'security',
      icon: ShieldCheck,
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      time: '1 hour ago',
      status: 'success',
    },
    {
      id: 'act-4',
      title: 'Gmail Account Synchronized',
      description: 'Synchronized recent message threads, attachments, and label states.',
      category: 'sync',
      icon: Mail,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      time: '2 hours ago',
      status: 'success',
    },
    {
      id: 'act-5',
      title: 'Smart Automation Rule Executed',
      description: 'Triggered "Auto-Star Sponsorship Proposals" on incoming email.',
      category: 'rules',
      icon: Zap,
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      time: '3 hours ago',
      status: 'success',
    },
  ];

  const filtered =
    filterType === 'all'
      ? staticActivities
      : staticActivities.filter((a) => a.category === filterType);

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
              <History className="w-6 h-6 text-blue-500" />
              <span>Activity & System Audit Log</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Audit log of mailbox synchronizations, AI intelligence operations, and automation triggers.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-2xl border border-slate-800/80 text-xs">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'ai', label: 'AI Intelligence' },
              { id: 'tasks', label: 'Action Items' },
              { id: 'security', label: 'Security' },
              { id: 'rules', label: 'Smart Rules' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  filterType === t.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Timeline List */}
        <div className="space-y-3">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl hover:border-slate-700/80 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${item.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-xs font-bold text-white truncate">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed truncate">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono block">{item.time}</span>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase tracking-wider">
                    Completed
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
