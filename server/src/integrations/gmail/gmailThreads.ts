import axios from 'axios';
import { logger } from '../../utils/logger';
import { createError } from '../../middleware/errorHandler';
import { GmailRawMessage, gmailMessagesApi } from './gmailMessages';

export interface GmailThreadResponse {
  id: string;
  snippet?: string;
  historyId?: string;
  messages: GmailRawMessage[];
}

export const gmailThreadsApi = {
  /**
   * Lists thread summaries from Gmail
   */
  async listThreads(
    accessToken: string,
    params: { q?: string; maxResults?: number; pageToken?: string; labelIds?: string[] } = {}
  ): Promise<{ threadIds: string[]; nextPageToken?: string; resultSizeEstimate: number }> {
    try {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.append('q', params.q);
      if (params.maxResults) searchParams.append('maxResults', String(params.maxResults));
      if (params.pageToken) searchParams.append('pageToken', params.pageToken);
      if (params.labelIds && params.labelIds.length > 0) {
        params.labelIds.forEach((l) => searchParams.append('labelIds', l));
      }

      const res = await axios.get<{
        threads?: Array<{ id: string; snippet: string; historyId: string }>;
        nextPageToken?: string;
        resultSizeEstimate?: number;
      }>(`https://gmail.googleapis.com/gmail/v1/users/me/threads?${searchParams.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const threadIds = (res.data.threads || []).map((t) => t.id);
      return {
        threadIds,
        nextPageToken: res.data.nextPageToken,
        resultSizeEstimate: res.data.resultSizeEstimate || 0,
      };
    } catch (error: any) {
      logger.error('Failed to list Gmail threads', { error: error.message });
      throw createError('Failed to retrieve email threads from Gmail.', 500, 'GMAIL_FETCH_FAILED');
    }
  },

  /**
   * Fetches an entire multi-message conversation thread from Gmail
   */
  async getThread(accessToken: string, threadId: string): Promise<any> {
    try {
      const res = await axios.get<GmailThreadResponse>(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const rawThread = res.data;
      const rawMessages = rawThread.messages || [];

      // Parse each individual message in the thread
      const messages = await Promise.all(
        rawMessages.map((msg) => gmailMessagesApi.getMessage(accessToken, msg.id))
      );

      // Sort by date ascending (chronological conversation flow)
      messages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const latestMessage = messages[messages.length - 1] || {};

      return {
        threadId: rawThread.id,
        snippet: rawThread.snippet || latestMessage.snippet || '',
        subject: latestMessage.subject || '(No Subject)',
        messageCount: messages.length,
        messages,
        latestDate: latestMessage.date || new Date(),
        isRead: messages.every((m) => m.isRead),
        isStarred: messages.some((m) => m.isStarred),
      };
    } catch (error: any) {
      logger.error('Failed to fetch Gmail thread details', { threadId, error: error.message });
      throw createError('Failed to fetch conversation thread from Gmail.', 500, 'GMAIL_FETCH_FAILED');
    }
  },

  /**
   * Trashes an entire thread in Gmail
   */
  async trashThread(accessToken: string, threadId: string): Promise<void> {
    try {
      await axios.post(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}/trash`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch (error: any) {
      logger.error('Failed to trash Gmail thread', { threadId, error: error.message });
      throw createError('Failed to move thread to trash.', 500, 'GMAIL_TRASH_FAILED');
    }
  },
};
