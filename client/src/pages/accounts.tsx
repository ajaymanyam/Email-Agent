import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppShell } from '@/components/AppShell';
import { useAccountStore } from '@/store/accountStore';
import { accountApi } from '@/services/accountApi';
import { getErrorMessage } from '@/services/api';
import {
  Users,
  Plus,
  ShieldCheck,
  Mail,
  ArrowRight,
  ExternalLink,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountsPage() {
  const router = useRouter();
  const { accounts, fetchAccounts, disconnectAccount, isLoading } = useAccountStore();
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();

    // Check OAuth return status in URL query
    if (router.query.status === 'connected') {
      toast.success('Gmail account connected successfully!');
      router.replace('/accounts', undefined, { shallow: true });
    } else if (router.query.error) {
      toast.error(`Connection failed: ${router.query.error}`);
      router.replace('/accounts', undefined, { shallow: true });
    }
  }, [router.query]);

  const handleConnectGmail = async () => {
    setConnectingGmail(true);
    try {
      const url = await accountApi.getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConnectingGmail(false);
    }
  };

  const handleConnectOutlook = async () => {
    try {
      const url = await accountApi.getMicrosoftAuthUrl();
      window.location.href = url;
    } catch (err) {
      toast.error('Microsoft OAuth is not configured. Please set MICROSOFT_CLIENT_ID in server/.env');
    }
  };

  const handleDisconnect = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to disconnect ${email}?`)) {
      return;
    }
    setDisconnectingId(id);
    try {
      await disconnectAccount(id);
      toast.success(`Disconnected ${email}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDisconnectingId(null);
    }
  };

  const getStatusBadge = (status: string, isConnected: boolean) => {
    if (!isConnected || status === 'disconnected') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <XCircle className="w-3 h-3 text-slate-400" />
          <span>Disconnected</span>
        </span>
      );
    }
    if (status === 'expired' || status === 'revoked') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Authorization Expired</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>Connected & Active</span>
      </span>
    );
  };

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Connected Email Accounts</h1>
          <p className="text-sm text-slate-400 mt-1">
            Authorize Gmail & Outlook mailboxes with Google/Microsoft OAuth 2.0. Access tokens are encrypted at rest.
          </p>
        </div>

        {/* Connected Accounts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Your Connected Inboxes ({accounts.length})
            </h2>
            <button
              onClick={() => fetchAccounts()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh Accounts"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400 mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">No email accounts connected yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Connect your Gmail account below to allow AI to summarize threads, extract tasks, and draft replies.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {accounts.map((acc) => (
                <div
                  key={acc._id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        acc.provider === 'gmail'
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                          : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                      }`}
                    >
                      {acc.provider === 'gmail' ? 'G' : 'O'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <span className="font-semibold text-sm text-white">{acc.email}</span>
                        {getStatusBadge(acc.status, acc.isConnected)}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Provider: {acc.provider.toUpperCase()} • Added{' '}
                        {new Date(acc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDisconnect(acc._id, acc.email)}
                      disabled={disconnectingId === acc._id}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      {disconnectingId === acc._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connect New Accounts Grid */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Available Providers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gmail Card */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-lg">
                    G
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    OAuth 2.0 Live
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Google / Gmail</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect your Google account. Grants official Gmail API access with encrypted token storage.
                </p>
              </div>

              <button
                onClick={handleConnectGmail}
                disabled={connectingGmail}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs shadow-lg shadow-red-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
              >
                {connectingGmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Connect Gmail Account</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Outlook Card */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                    O
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                    Microsoft 365
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Microsoft / Outlook</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect your Outlook.com or Microsoft 365 corporate mailbox via Microsoft Graph API.
                </p>
              </div>

              <button
                onClick={handleConnectOutlook}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition flex items-center justify-center space-x-2 active:scale-98"
              >
                <span>Connect Outlook Account</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start space-x-4">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-200">Security & Encryption Guarantee</p>
            <p>
              We never ask for your email password. Refresh tokens are encrypted at rest with AES-256-GCM and stored only on the backend server. Tokens are never exposed to client-side code.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
