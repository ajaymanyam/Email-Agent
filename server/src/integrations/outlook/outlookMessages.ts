import axios from 'axios';
import { logger } from '../../utils/logger';
import { createError } from '../../middleware/errorHandler';

export interface OutlookMessageDetail {
  providerMessageId: string;
  providerThreadId: string;
  subject: string;
  from: { name: string; email: string };
  to: Array<{ name: string; email: string }>;
  cc: Array<{ name: string; email: string }>;
  bcc: Array<{ name: string; email: string }>;
  date: Date;
  snippet: string;
  bodyText: string;
  bodyHtml: string;
  isRead: boolean;
  isStarred: boolean;
  isTrash: boolean;
  isSpam: boolean;
  labels: string[];
  attachments: any[];
}

export const outlookMessagesApi = {
  /**
   * Lists messages from Microsoft Graph API
   */
  async listMessages(
    accessToken: string,
    params: { maxResults?: number } = {}
  ): Promise<OutlookMessageDetail[]> {
    try {
      const top = params.maxResults || 25;
      const res = await axios.get(
        `https://graph.microsoft.com/v1.0/me/messages?$top=${top}&$select=id,conversationId,subject,from,toRecipients,ccRecipients,bccRecipients,receivedDateTime,bodyPreview,body,isRead,flag,parentFolderId`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const items = res.data.value || [];
      return items.map((msg: any) => ({
        providerMessageId: msg.id,
        providerThreadId: msg.conversationId || msg.id,
        subject: msg.subject || '(No Subject)',
        from: {
          name: msg.from?.emailAddress?.name || msg.from?.emailAddress?.address || '',
          email: msg.from?.emailAddress?.address || '',
        },
        to: (msg.toRecipients || []).map((r: any) => ({
          name: r.emailAddress?.name || r.emailAddress?.address || '',
          email: r.emailAddress?.address || '',
        })),
        cc: (msg.ccRecipients || []).map((r: any) => ({
          name: r.emailAddress?.name || r.emailAddress?.address || '',
          email: r.emailAddress?.address || '',
        })),
        bcc: (msg.bccRecipients || []).map((r: any) => ({
          name: r.emailAddress?.name || r.emailAddress?.address || '',
          email: r.emailAddress?.address || '',
        })),
        date: new Date(msg.receivedDateTime || Date.now()),
        snippet: msg.bodyPreview || '',
        bodyText: msg.body?.contentType === 'text' ? msg.body?.content || '' : (msg.bodyPreview || ''),
        bodyHtml: msg.body?.contentType === 'html' ? msg.body?.content || '' : '',
        isRead: !!msg.isRead,
        isStarred: msg.flag?.flagStatus === 'flagged',
        isTrash: false,
        isSpam: false,
        labels: msg.isRead ? [] : ['UNREAD'],
        attachments: [],
      }));
    } catch (err: any) {
      logger.error('Failed to list Microsoft Outlook messages', { error: err.message });
      throw createError('Failed to fetch messages from Microsoft Outlook.', 502, 'OUTLOOK_API_FAILURE');
    }
  },

  /**
   * Sends email via Microsoft Graph API
   */
  async sendMessage(
    accessToken: string,
    payload: {
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      bodyText: string;
      bodyHtml?: string;
    }
  ): Promise<{ id: string }> {
    try {
      const message = {
        subject: payload.subject,
        body: {
          contentType: payload.bodyHtml ? 'HTML' : 'Text',
          content: payload.bodyHtml || payload.bodyText,
        },
        toRecipients: payload.to.map((addr) => ({
          emailAddress: { address: addr },
        })),
        ccRecipients: (payload.cc || []).map((addr) => ({
          emailAddress: { address: addr },
        })),
        bccRecipients: (payload.bcc || []).map((addr) => ({
          emailAddress: { address: addr },
        })),
      };

      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        { message, saveToSentItems: 'true' },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { id: `ms_${Date.now()}` };
    } catch (err: any) {
      logger.error('Failed to send email via Microsoft Graph', { error: err.message });
      throw createError('Failed to send email via Microsoft Outlook.', 502, 'OUTLOOK_SEND_FAILURE');
    }
  },
};
