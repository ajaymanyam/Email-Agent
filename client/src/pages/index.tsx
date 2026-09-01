import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import {
  Sparkles,
  ShieldCheck,
  Mail,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Bot,
  Inbox,
  Send,
  Calendar,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 text-white font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
              Intelligent Email Assistant
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition duration-200"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition duration-200"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen AI Email Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Your Inbox, Elevated by{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Artificial Intelligence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Connect your real Gmail & Outlook accounts securely. Let AI summarize threads,
            detect priorities, extract deadlines, draft replies, and protect you from phishing — all in one modern client.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push(isAuthenticated ? '/dashboard' : '/register')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-blue-600/30 transition duration-200 flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>Connect Your Inbox</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-base transition duration-200"
            >
              Live Demo & Sign In
            </button>
          </div>

          {/* Social Proof / Security Badges */}
          <div className="mt-14 pt-10 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>OAuth 2.0 Real Provider Auth</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>AES-256 Encrypted at Rest</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>OpenRouter & Gemini AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Zero Hardcoded Passwords</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Transform How You Work With Email
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Engineered with deep email integration and an advanced AI intelligence layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Summarization & Explain</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instantly digest 50-message threads into executive summaries, key decisions, and action items. Explain technical emails in simple language.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-6">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Reply & Rewriting</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate context-aware reply drafts in multiple tones (professional, friendly, formal, concise). Rewrite or polish your draft before sending.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Spam & Phishing Detection</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-assisted security scan detects impersonation, suspicious links, and urgent financial traps before you interact with dangerous messages.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Priority Inbox & Tasks</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automatically identify urgent emails requiring immediate response, extract action items with deadlines, and track them to completion.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Calendar Integration</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Detect meeting dates, follow-up deadlines, and delivery schedules from email text, and add them to Google Calendar with a single click.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Account Support</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Seamlessly connect and switch between multiple Gmail and Outlook accounts under a single unified, secure productivity workspace.
            </p>
          </div>
        </div>
      </section>

      {/* Security Architecture Callout */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#0b0f19] border border-slate-800/90 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
              <Lock className="w-3.5 h-3.5" />
              <span>Enterprise-Grade Security Architecture</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Your Privacy & Credentials Are Non-Negotiable
            </h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
              We never request or store your email password. All provider access occurs through official OAuth 2.0 protocols with AES-256 token encryption at rest. AI drafts and calendar events never send automatically without your explicit confirmation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero token leakage to frontend code</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Advisory AI — never deletes or auto-sends</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strict CORS & Helmet security headers</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strict rate limiting & input sanitization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>© 2026 Intelligent Email Assistant. Built with Next.js, Express, TypeScript & OpenRouter/Gemini AI.</p>
      </footer>
    </div>
  );
}
