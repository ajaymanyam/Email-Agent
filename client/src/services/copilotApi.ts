import { api } from './api';
import { AiDraft, ScheduledEmail, NLSearchResult } from '@/types/copilot';
import { EmailMessage } from '@/types/email';

export const copilotApi = {
  async generateDrafts(): Promise<{ createdCount: number; drafts: AiDraft[] }> {
    const res = await api.post<{
      success: boolean;
      message: string;
      data: { createdCount: number; drafts: AiDraft[] };
    }>('/copilot/generate-drafts');
    return res.data.data;
  },

  async getDrafts(): Promise<AiDraft[]> {
    const res = await api.get<{ success: boolean; data: { drafts: AiDraft[] } }>(
      '/copilot/drafts'
    );
    return res.data.data.drafts;
  },

  async acceptDraft(id: string): Promise<EmailMessage> {
    const res = await api.post<{
      success: boolean;
      message: string;
      data: { email: EmailMessage };
    }>(`/copilot/drafts/${id}/accept`);
    return res.data.data.email;
  },

  async discardDraft(id: string): Promise<void> {
    await api.post(`/copilot/drafts/${id}/discard`);
  },

  async getScheduled(): Promise<ScheduledEmail[]> {
    const res = await api.get<{ success: boolean; data: { scheduled: ScheduledEmail[] } }>(
      '/copilot/scheduled'
    );
    return res.data.data.scheduled;
  },

  async scheduleEmail(payload: {
    accountId?: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    bodyText: string;
    bodyHtml?: string;
    scheduledFor: string;
    threadId?: string;
  }): Promise<ScheduledEmail> {
    const res = await api.post<{
      success: boolean;
      message: string;
      data: { scheduled: ScheduledEmail };
    }>('/copilot/schedule', payload);
    return res.data.data.scheduled;
  },

  async cancelScheduled(id: string): Promise<void> {
    await api.delete(`/copilot/scheduled/${id}`);
  },

  async naturalLanguageSearch(q: string): Promise<NLSearchResult> {
    const res = await api.post<{ success: boolean; data: NLSearchResult }>(
      '/copilot/nl-search',
      { q }
    );
    return res.data.data;
  },
};
