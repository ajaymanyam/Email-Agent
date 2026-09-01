import { create } from 'zustand';
import { EmailMessage, EmailThread } from '@/types/email';
import { emailApi, ListEmailsParams } from '@/services/emailApi';

interface EmailStore {
  emails: EmailMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  activeView: string;
  searchQuery: string;
  isLoading: boolean;
  isSyncing: boolean;
  activeThread: EmailThread | null;
  selectedEmail: EmailMessage | null;

  fetchEmails: (params?: ListEmailsParams) => Promise<void>;
  syncInbox: (accountId?: string) => Promise<number>;
  fetchThread: (threadId: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  markRead: (id: string, isRead?: boolean) => Promise<void>;
  archiveEmail: (id: string) => Promise<void>;
  trashEmail: (id: string) => Promise<void>;
  setActiveView: (view: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  emails: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  activeView: 'inbox',
  searchQuery: '',
  isLoading: false,
  isSyncing: false,
  activeThread: null,
  selectedEmail: null,

  fetchEmails: async (params = {}) => {
    set({ isLoading: true });
    try {
      const view = params.view || get().activeView;
      const q = params.q !== undefined ? params.q : get().searchQuery;
      const res = await emailApi.listEmails({
        ...params,
        view,
        q,
        page: params.page || get().page,
        limit: params.limit || get().limit,
      });

      set({
        emails: res.emails,
        total: res.total,
        page: res.page,
        limit: res.limit,
        totalPages: res.totalPages,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  syncInbox: async (accountId) => {
    set({ isSyncing: true });
    try {
      const res = await emailApi.syncInbox(accountId);
      await get().fetchEmails();
      set({ isSyncing: false });
      return res.syncedCount;
    } catch (err) {
      set({ isSyncing: false });
      throw err;
    }
  },

  fetchThread: async (threadId) => {
    set({ isLoading: true });
    try {
      const thread = await emailApi.getThread(threadId);
      set({ activeThread: thread, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  toggleStar: async (id) => {
    // Optimistic UI update
    set((state) => ({
      emails: state.emails.map((e) =>
        e._id === id ? { ...e, isStarred: !e.isStarred } : e
      ),
    }));
    await emailApi.toggleStar(id);
  },

  markRead: async (id, isRead = true) => {
    set((state) => ({
      emails: state.emails.map((e) =>
        e._id === id ? { ...e, isRead } : e
      ),
    }));
    await emailApi.markRead(id, isRead);
  },

  archiveEmail: async (id) => {
    set((state) => ({
      emails: state.emails.filter((e) => e._id !== id),
      total: Math.max(0, state.total - 1),
    }));
    await emailApi.archiveEmail(id);
  },

  trashEmail: async (id) => {
    set((state) => ({
      emails: state.emails.filter((e) => e._id !== id),
      total: Math.max(0, state.total - 1),
    }));
    await emailApi.trashEmail(id);
  },

  setActiveView: (view) => {
    set({ activeView: view, page: 1 });
    get().fetchEmails({ view, page: 1 });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, page: 1 });
    get().fetchEmails({ q: query, page: 1 });
  },
}));
