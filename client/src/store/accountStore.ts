import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EmailAccount } from '@/types/account';
import { accountApi } from '@/services/accountApi';
import { useEmailStore } from './emailStore';

interface AccountStore {
  accounts: EmailAccount[];
  activeAccount: EmailAccount | null;
  isLoading: boolean;
  error: string | null;

  setAccounts: (accounts: EmailAccount[]) => void;
  setActiveAccount: (account: EmailAccount | null) => void;
  fetchAccounts: () => Promise<void>;
  disconnectAccount: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      accounts: [],
      activeAccount: null,
      isLoading: false,
      error: null,

      setAccounts: (accounts) => {
        const connected = accounts.filter((a) => a.isConnected && a.status === 'connected');
        const currentActive = get().activeAccount;
        const active =
          connected.find((a) => a._id === currentActive?._id) ||
          connected[0] ||
          null;

        set({ accounts, activeAccount: active });
      },

      setActiveAccount: (account) => set({ activeAccount: account }),

      fetchAccounts: async () => {
        set({ isLoading: true, error: null });
        try {
          const accounts = await accountApi.listAccounts();
          const connected = accounts.filter((a) => a.isConnected && a.status === 'connected');
          const currentActive = get().activeAccount;
          const active =
            connected.find((a) => a._id === currentActive?._id) ||
            connected[0] ||
            null;

          set({ accounts, activeAccount: active, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      disconnectAccount: async (id: string) => {
        await accountApi.disconnectAccount(id);
        const currentActive = get().activeAccount;
        if (currentActive?._id === id) {
          set({ activeAccount: null });
        }
        // Clear all cached emails in the UI immediately
        useEmailStore.setState({ emails: [], total: 0, activeThread: null, selectedEmail: null });
        await get().fetchAccounts();
      },
    }),
    {
      name: 'account-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeAccount: state.activeAccount }),
    }
  )
);
