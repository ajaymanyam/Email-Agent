import { create } from 'zustand';

type SidebarSection =
  | 'inbox'
  | 'starred'
  | 'important'
  | 'sent'
  | 'drafts'
  | 'archived'
  | 'spam'
  | 'trash'
  | 'priority'
  | 'action-items'
  | 'templates'
  | 'analytics'
  | 'activities'
  | 'settings';

interface UIStore {
  sidebarOpen: boolean;
  activeSection: SidebarSection;
  theme: 'light' | 'dark' | 'system';
  composeOpen: boolean;
  selectedEmailIds: string[];

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveSection: (section: SidebarSection) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setComposeOpen: (open: boolean) => void;
  toggleEmailSelection: (id: string) => void;
  clearEmailSelection: () => void;
  selectAllEmails: (ids: string[]) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activeSection: 'inbox',
  theme: 'system',
  composeOpen: false,
  selectedEmailIds: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveSection: (section) => set({ activeSection: section }),
  setTheme: (theme) => set({ theme }),
  setComposeOpen: (open) => set({ composeOpen: open }),

  toggleEmailSelection: (id) =>
    set((s) => ({
      selectedEmailIds: s.selectedEmailIds.includes(id)
        ? s.selectedEmailIds.filter((e) => e !== id)
        : [...s.selectedEmailIds, id],
    })),

  clearEmailSelection: () => set({ selectedEmailIds: [] }),
  selectAllEmails: (ids) => set({ selectedEmailIds: ids }),
}));
