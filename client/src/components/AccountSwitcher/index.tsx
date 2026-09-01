import React, { useState, useEffect } from 'react';
import { useAccountStore } from '@/store/accountStore';
import { useRouter } from 'next/router';
import { ChevronDown, Mail, Plus, Check, Layers } from 'lucide-react';

export const AccountSwitcher: React.FC = () => {
  const router = useRouter();
  const { accounts, activeAccount, setActiveAccount, fetchAccounts } = useAccountStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (accounts.length === 0) {
    return (
      <button
        onClick={() => router.push('/accounts')}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Connect Inbox</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition"
      >
        <div className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] uppercase">
          {activeAccount ? (activeAccount.provider === 'gmail' ? 'G' : 'O') : '🌐'}
        </div>
        <span className="text-xs font-medium text-slate-200 max-w-[140px] truncate">
          {activeAccount ? activeAccount.email : 'All Inboxes (Unified)'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#1e293b] border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/80 mb-1">
            Connected Inboxes
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            <button
              onClick={() => {
                setActiveAccount(null);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                !activeAccount
                  ? 'bg-purple-600/20 text-purple-300 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-4 h-4 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center text-[9px] font-bold">
                  <Layers className="w-3 h-3" />
                </div>
                <span className="truncate">All Inboxes (Unified)</span>
              </div>
              {!activeAccount && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
            </button>

            {accounts.map((acc) => {
              const isSelected = activeAccount?._id === acc._id;
              return (
                <button
                  key={acc._id}
                  onClick={() => {
                    setActiveAccount(acc);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-300 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-bold ${
                        acc.provider === 'gmail'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {acc.provider === 'gmail' ? 'G' : 'O'}
                    </div>
                    <span className="truncate">{acc.email}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-700/80">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/accounts');
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect Another Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSwitcher;
