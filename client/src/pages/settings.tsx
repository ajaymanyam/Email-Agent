import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/authApi';
import { getErrorMessage } from '@/services/api';
import { Settings, User, Bot, Bell, Shield, Palette, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [defaultTone, setDefaultTone] = useState(user?.preferences?.defaultTone || 'professional');
  const [theme, setTheme] = useState(user?.preferences?.theme || 'system');
  const [autoSummarize, setAutoSummarize] = useState(user?.preferences?.autoSummarize || false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.notificationsEnabled ?? true
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await authApi.updateProfile({
        name,
        preferences: {
          defaultTone: defaultTone as 'professional' | 'friendly' | 'formal' | 'concise',
          theme: theme as 'light' | 'dark' | 'system',
          emailsPerPage: user?.preferences?.emailsPerPage || 20,
          autoSummarize,
          notificationsEnabled,
        },
      });
      setUser(updated);
      toast.success('Preferences updated successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Settings & Preferences</h1>
          <p className="text-sm text-slate-400 mt-1">
            Customize your AI intelligence tone, profile, security, and notification settings.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Section */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <User className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Profile Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address (Primary Account)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/50 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* AI Intelligence Preferences */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <Bot className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">AI Intelligence Preferences</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Default AI Reply Tone
                </label>
                <select
                  value={defaultTone}
                  onChange={(e) => setDefaultTone(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="concise">Concise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Theme Appearance
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="system">System Default</option>
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSummarize}
                  onChange={(e) => setAutoSummarize(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-purple-500/20"
                />
                <span className="text-xs text-slate-300">
                  Automatically generate AI summaries when opening long threads (&gt; 3 messages)
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-xs text-slate-300">
                  Enable high-priority email notifications and security alerts
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition flex items-center space-x-2 disabled:opacity-50 active:scale-95"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
