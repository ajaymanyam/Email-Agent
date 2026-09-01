import { api } from './api';
import { EmailMessage, EmailListResponse, EmailThread } from '@/types/email';

export interface ListEmailsParams {
  accountId?: string;
  view?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export const emailApi = {
  async syncInbox(accountId?: string): Promise<{ syncedCount: number }> {
    const res = await api.post<{
      success: boolean;
      message: string;
      data: { syncedCount: number };
    }>('/emails/sync', { accountId });
    return res.data.data;
  },

  async listEmails(params: ListEmailsParams = {}): Promise<EmailListResponse> {
    const res = await api.get<{ success: boolean; data: EmailListResponse }>('/emails', {
      params,
    });
    return res.data.data;
  },

  async getEmail(id: string): Promise<EmailMessage> {
    const res = await api.get<{ success: boolean; data: { email: EmailMessage } }>(
      `/emails/${id}`
    );
    return res.data.data.email;
  },

  async getThread(threadId: string): Promise<EmailThread> {
    const res = await api.get<{ success: boolean; data: { thread: EmailThread } }>(
      `/emails/threads/${threadId}`
    );
    return res.data.data.thread;
  },

  async toggleStar(id: string): Promise<{ isStarred: boolean }> {
    const res = await api.post<{ success: boolean; data: { isStarred: boolean } }>(
      `/emails/${id}/star`
    );
    return res.data.data;
  },

  async markRead(id: string, isRead = true): Promise<{ isRead: boolean }> {
    const res = await api.post<{ success: boolean; data: { isRead: boolean } }>(
      `/emails/${id}/read`,
      { isRead }
    );
    return res.data.data;
  },

  async archiveEmail(id: string): Promise<void> {
    await api.post(`/emails/${id}/archive`);
  },

  async trashEmail(id: string): Promise<void> {
    await api.post(`/emails/${id}/trash`);
  },

  async sendEmail(payload: {
    accountId?: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    bodyText?: string;
    bodyHtml?: string;
    threadId?: string;
    attachments?: Array<{ filename: string; mimeType: string; contentBase64: string }>;
  }): Promise<EmailMessage> {
    const res = await api.post<{ success: boolean; data: { email: EmailMessage } }>(
      '/emails/send',
      payload
    );
    return res.data.data.email;
  },

  async syncAll(): Promise<{ totalSynced: number; accountsSynced: number }> {
    const res = await api.post<{
      success: boolean;
      message: string;
      data: { totalSynced: number; accountsSynced: number };
    }>('/emails/sync-all');
    return res.data.data;
  },

  async exportThread(threadId: string, format: 'eml' | 'json' = 'eml'): Promise<void> {
    const response = await api.get(`/emails/threads/${threadId}/export?format=${format}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: format === 'json' ? 'application/json' : 'message/rfc822',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thread_${threadId}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
