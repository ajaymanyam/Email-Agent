import axios from 'axios';
import { logger } from '../../utils/logger';
import { createError } from '../../middleware/errorHandler';

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailMessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailHeader[];
  body: {
    size: number;
    data?: string;
    attachmentId?: string;
  };
  parts?: GmailMessagePart[];
}

export interface GmailRawMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: {
    partId: string;
    mimeType: string;
    filename: string;
    headers: GmailHeader[];
    body: {
      size: number;
      data?: string;
    };
    parts?: GmailMessagePart[];
  };
}

/**
 * Base64URL decoder for email bodies
 */
function decodeBase64Url(data: string): string {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    return '';
  }
}

/**
 * Parses header value by name
 */
function getHeader(headers: GmailHeader[], name: string): string {
  const target = name.toLowerCase();
  const found = headers.find((h) => h.name.toLowerCase() === target);
  return found ? found.value : '';
}

/**
 * Parses email and name from strings like "John Doe <john@example.com>" or "john@example.com"
 */
function parseEmailAddress(raw: string): { name: string; email: string } {
  if (!raw) return { name: '', email: '' };

  const match = raw.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    const name = (match[1] || '').trim().replace(/^["']|["']$/g, '');
    const email = (match[2] || '').trim().toLowerCase();
    return { name, email };
  }

  const cleaned = raw.trim().replace(/^["']|["']$/g, '');
  return { name: '', email: cleaned.toLowerCase() };
}

/**
 * Parses multi-recipient strings like "a@b.com, c@d.com"
 */
function parseMultiEmailAddresses(raw: string): Array<{ name: string; email: string }> {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => parseEmailAddress(s.trim()))
    .filter((e) => e.email.length > 0);
}

/**
 * Recursively extracts plain text and HTML bodies from MIME parts
 */
function extractBodyFromParts(payload: any): { text: string; html: string; attachments: any[] } {
  let text = '';
  let html = '';
  const attachments: any[] = [];

  function traverse(part: any) {
    if (!part) return;

    if (part.filename && part.body?.attachmentId) {
      attachments.push({
        attachmentId: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType || 'application/octet-stream',
        size: part.body.size || 0,
      });
    }

    if (part.mimeType === 'text/plain' && part.body?.data) {
      text += decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      html += decodeBase64Url(part.body.data);
    }

    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(traverse);
    }
  }

  if (payload.body?.data) {
    if (payload.mimeType === 'text/html') {
      html = decodeBase64Url(payload.body.data);
    } else {
      text = decodeBase64Url(payload.body.data);
    }
  }

  if (payload.parts) {
    payload.parts.forEach(traverse);
  }

  return { text, html, attachments };
}

export const gmailMessagesApi = {
  /**
   * Lists message IDs matching query or filter from Gmail
   */
  async listMessages(
    accessToken: string,
    params: { q?: string; maxResults?: number; pageToken?: string; labelIds?: string[] } = {}
  ): Promise<{ messageIds: string[]; nextPageToken?: string; resultSizeEstimate: number }> {
    try {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.append('q', params.q);
      if (params.maxResults) searchParams.append('maxResults', String(params.maxResults));
      if (params.pageToken) searchParams.append('pageToken', params.pageToken);
      if (params.labelIds && params.labelIds.length > 0) {
        params.labelIds.forEach((l) => searchParams.append('labelIds', l));
      }

      const res = await axios.get<{
        messages?: Array<{ id: string; threadId: string }>;
        nextPageToken?: string;
        resultSizeEstimate?: number;
      }>(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${searchParams.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const messageIds = (res.data.messages || []).map((m) => m.id);
      return {
        messageIds,
        nextPageToken: res.data.nextPageToken,
        resultSizeEstimate: res.data.resultSizeEstimate || 0,
      };
    } catch (error: any) {
      logger.error('Failed to list Gmail messages', { error: error.message });
      throw createError('Failed to retrieve messages from Gmail.', 500, 'GMAIL_FETCH_FAILED');
    }
  },

  /**
   * Fetches full details for a single message from Gmail
   */
  async getMessage(accessToken: string, messageId: string): Promise<any> {
    try {
      const res = await axios.get<GmailRawMessage>(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const raw = res.data;
      const headers = raw.payload?.headers || [];

      const fromRaw = getHeader(headers, 'From');
      const toRaw = getHeader(headers, 'To');
      const ccRaw = getHeader(headers, 'Cc');
      const bccRaw = getHeader(headers, 'Bcc');
      const subject = getHeader(headers, 'Subject') || '(No Subject)';
      const dateHeader = getHeader(headers, 'Date');

      const date = dateHeader
        ? new Date(dateHeader)
        : raw.internalDate
        ? new Date(parseInt(raw.internalDate, 10))
        : new Date();

      const labelIds = raw.labelIds || [];
      const { text, html, attachments } = extractBodyFromParts(raw.payload);

      return {
        providerMessageId: raw.id,
        providerThreadId: raw.threadId,
        from: parseEmailAddress(fromRaw),
        to: parseMultiEmailAddresses(toRaw),
        cc: parseMultiEmailAddresses(ccRaw),
        bcc: parseMultiEmailAddresses(bccRaw),
        subject,
        snippet: raw.snippet || '',
        bodyText: text || raw.snippet || '',
        bodyHtml: html || (text ? `<pre>${text}</pre>` : ''),
        date,
        isRead: !labelIds.includes('UNREAD'),
        isStarred: labelIds.includes('STARRED'),
        isImportant: labelIds.includes('IMPORTANT'),
        isDraft: labelIds.includes('DRAFT'),
        isTrash: labelIds.includes('TRASH'),
        isSpam: labelIds.includes('SPAM'),
        labels: labelIds,
        attachments,
      };
    } catch (error: any) {
      logger.error('Failed to fetch Gmail message details', {
        messageId,
        error: error.message,
      });
      throw createError('Failed to fetch message details from Gmail.', 500, 'GMAIL_FETCH_FAILED');
    }
  },

  /**
   * Modifies Gmail message labels (Star/Unstar, Mark Read/Unread, Archive, etc.)
   */
  async modifyLabels(
    accessToken: string,
    messageId: string,
    addLabelIds: string[] = [],
    removeLabelIds: string[] = []
  ): Promise<string[]> {
    try {
      const res = await axios.post<{ labelIds: string[] }>(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
        {
          addLabelIds,
          removeLabelIds,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return res.data.labelIds || [];
    } catch (error: any) {
      logger.error('Failed to modify Gmail message labels', {
        messageId,
        error: error.message,
      });
      throw createError('Failed to update email in Gmail.', 500, 'GMAIL_MODIFY_FAILED');
    }
  },

  /**
   * Moves a message to Gmail Trash
   */
  async trashMessage(accessToken: string, messageId: string): Promise<void> {
    try {
      await axios.post(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch (error: any) {
      logger.error('Failed to trash Gmail message', { messageId, error: error.message });
      throw createError('Failed to move email to trash.', 500, 'GMAIL_TRASH_FAILED');
    }
  },

  /**
   * Restores a message from Gmail Trash
   */
  async untrashMessage(accessToken: string, messageId: string): Promise<void> {
    try {
      await axios.post(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/untrash`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch (error: any) {
      logger.error('Failed to untrash Gmail message', { messageId, error: error.message });
      throw createError('Failed to restore email from trash.', 500, 'GMAIL_UNTRASH_FAILED');
    }
  },
};
