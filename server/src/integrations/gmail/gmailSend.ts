import axios from 'axios';
import { logger } from '../../utils/logger';
import { createError } from '../../middleware/errorHandler';

export interface SendEmailPayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    contentBase64: string;
  }>;
}

/**
 * Builds an RFC 2822 MIME formatted message string and converts to base64url.
 */
export function buildRawEmailMessage(payload: SendEmailPayload): string {
  const boundary = `====_NextPart_${Date.now()}_====`;
  const hasAttachments = payload.attachments && payload.attachments.length > 0;

  const headers: string[] = [
    `To: ${payload.to.join(', ')}`,
    payload.cc && payload.cc.length > 0 ? `Cc: ${payload.cc.join(', ')}` : '',
    payload.bcc && payload.bcc.length > 0 ? `Bcc: ${payload.bcc.join(', ')}` : '',
    `Subject: =?UTF-8?B?${Buffer.from(payload.subject || '').toString('base64')}?=`,
    'MIME-Version: 1.0',
  ];

  if (payload.inReplyTo) {
    headers.push(`In-Reply-To: ${payload.inReplyTo}`);
  }
  if (payload.references) {
    headers.push(`References: ${payload.references}`);
  }

  const validHeaders = headers.filter(Boolean);

  let messageLines: string[] = [];

  if (hasAttachments) {
    validHeaders.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    messageLines = [...validHeaders, '', `--${boundary}`];

    // HTML/Text alternative part
    if (payload.bodyHtml) {
      messageLines.push('Content-Type: text/html; charset=UTF-8');
      messageLines.push('Content-Transfer-Encoding: 7bit');
      messageLines.push('', payload.bodyHtml, '');
    } else {
      messageLines.push('Content-Type: text/plain; charset=UTF-8');
      messageLines.push('Content-Transfer-Encoding: 7bit');
      messageLines.push('', payload.bodyText || '', '');
    }

    // Attachments parts
    for (const att of payload.attachments!) {
      messageLines.push(`--${boundary}`);
      messageLines.push(`Content-Type: ${att.mimeType || 'application/octet-stream'}; name="${att.filename}"`);
      messageLines.push(`Content-Disposition: attachment; filename="${att.filename}"`);
      messageLines.push('Content-Transfer-Encoding: base64');
      messageLines.push('', att.contentBase64, '');
    }

    messageLines.push(`--${boundary}--`);
  } else if (payload.bodyHtml) {
    validHeaders.push('Content-Type: text/html; charset=UTF-8');
    validHeaders.push('Content-Transfer-Encoding: 7bit');
    messageLines = [...validHeaders, '', payload.bodyHtml];
  } else {
    validHeaders.push('Content-Type: text/plain; charset=UTF-8');
    validHeaders.push('Content-Transfer-Encoding: 7bit');
    messageLines = [...validHeaders, '', payload.bodyText || ''];
  }

  const rawString = messageLines.join('\r\n');

  // Convert raw RFC 2822 to Base64URL
  return Buffer.from(rawString)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const gmailSendApi = {
  /**
   * Sends an email via the Gmail API
   */
  async sendEmail(
    accessToken: string,
    payload: SendEmailPayload
  ): Promise<{ id: string; threadId: string; labelIds: string[] }> {
    try {
      const raw = buildRawEmailMessage(payload);

      const requestBody: { raw: string; threadId?: string } = { raw };
      if (payload.threadId) {
        requestBody.threadId = payload.threadId;
      }

      const res = await axios.post<{ id: string; threadId: string; labelIds: string[] }>(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Gmail message sent successfully', {
        id: res.data.id,
        threadId: res.data.threadId,
      });

      return res.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      logger.error('Failed to send email via Gmail API', { error: errorMsg });
      throw createError(`Failed to send email: ${errorMsg}`, 500, 'GMAIL_SEND_FAILED');
    }
  },
};
