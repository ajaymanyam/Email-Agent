import { api } from './api';
import { ActionItem, ActionItemFilterOptions, CreateActionItemPayload } from '@/types/actionItem';

export const actionItemApi = {
  async listActionItems(filters: ActionItemFilterOptions = {}): Promise<ActionItem[]> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);

    const res = await api.get<{ success: boolean; data: ActionItem[] }>(
      `/action-items?${params.toString()}`
    );
    return res.data.data;
  },

  async createActionItem(payload: CreateActionItemPayload): Promise<ActionItem> {
    const res = await api.post<{ success: boolean; data: ActionItem }>('/action-items', payload);
    return res.data.data;
  },

  async updateActionItem(
    id: string,
    updates: Partial<ActionItem>
  ): Promise<ActionItem> {
    const res = await api.patch<{ success: boolean; data: ActionItem }>(
      `/action-items/${id}`,
      updates
    );
    return res.data.data;
  },

  async deleteActionItem(id: string): Promise<void> {
    await api.delete(`/action-items/${id}`);
  },

  async extractFromEmail(emailId: string): Promise<ActionItem[]> {
    const res = await api.post<{ success: boolean; data: ActionItem[] }>(
      `/action-items/extract/${emailId}`
    );
    return res.data.data;
  },

  async syncToCalendar(id: string): Promise<{ eventId: string; htmlLink: string }> {
    const res = await api.post<{ success: boolean; data: { eventId: string; htmlLink: string }; message: string }>(
      `/action-items/${id}/calendar`
    );
    return res.data.data;
  },
};
