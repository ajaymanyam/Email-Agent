import { EmailMessage, IEmailMessage } from '../models/EmailMessage';
import { EmailAccount } from '../models/EmailAccount';
import { accountService } from './accountService';
import { gmailMessagesApi } from '../integrations/gmail/gmailMessages';
import { gmailThreadsApi } from '../integrations/gmail/gmailThreads';
import { gmailSendApi } from '../integrations/gmail/gmailSend';
import { outlookMessagesApi } from '../integrations/outlook/outlookMessages';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface EmailListParams {
  accountId?: string;
  view?: 'inbox' | 'unread' | 'starred' | 'important' | 'sent' | 'drafts' | 'trash' | 'spam' | 'priority' | 'archived';
  q?: string;
  page?: number;
  limit?: number;
  syncLive?: boolean;
}

export const emailService = {
  /**
   * Synchronizes recent emails from Gmail or Microsoft Outlook into MongoDB cache
   */
  async syncGmailInbox(userId: string, accountId?: string): Promise<{ syncedCount: number }> {
    if (accountId === 'all') {
      const allRes = await emailService.syncAllAccounts(userId);
      return { syncedCount: allRes.totalSynced };
    }

    let targetAccount;
    if (accountId && accountId !== 'all') {
      targetAccount = await accountService.getAccountById(userId, accountId);
    } else {
      const accounts = await accountService.getAccountsForUser(userId);
      targetAccount = accounts.find((a) => a.isConnected);
    }

    if (!targetAccount) {
      return { syncedCount: 0 };
    }

    const accessToken = await accountService.getValidAccessToken(targetAccount._id.toString());
    let syncedCount = 0;

    if (targetAccount.provider === 'outlook') {
      const messages = await outlookMessagesApi.listMessages(accessToken, { maxResults: 25 });
      for (const msg of messages) {
        try {
          await EmailMessage.findOneAndUpdate(
            {
              owner: userId,
              emailAccountId: targetAccount._id,
              providerMessageId: msg.providerMessageId,
            },
            {
              $set: {
                ...msg,
                owner: userId,
                emailAccountId: targetAccount._id,
                provider: 'outlook',
              },
            },
            { upsert: true, new: true, runValidators: true }
          );
          syncedCount++;
        } catch (err: any) {
          logger.warn('Failed to sync Outlook message', { msgId: msg.providerMessageId, error: err.message });
        }
      }
    } else {
      const { messageIds } = await gmailMessagesApi.listMessages(accessToken, { maxResults: 25 });
      for (const msgId of messageIds) {
        try {
          const details = await gmailMessagesApi.getMessage(accessToken, msgId);

          await EmailMessage.findOneAndUpdate(
            {
              owner: userId,
              emailAccountId: targetAccount._id,
              providerMessageId: details.providerMessageId,
            },
            {
              $set: {
                ...details,
                owner: userId,
                emailAccountId: targetAccount._id,
                provider: 'gmail',
              },
            },
            { upsert: true, new: true, runValidators: true }
          );
          syncedCount++;
        } catch (err: any) {
          logger.warn('Failed to sync individual message', { msgId, error: err.message });
        }
      }
    }

    logger.info('Inbox synced successfully', {
      userId,
      provider: targetAccount.provider,
      accountId: targetAccount._id.toString(),
      syncedCount,
    });

    return { syncedCount };
  },

  /**
   * Lists emails with filters, search, and pagination
   */
  async listEmails(userId: string, params: EmailListParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = { owner: userId };

    if (params.accountId && params.accountId !== 'all') {
      query.emailAccountId = params.accountId;
    }

    // Apply view filters
    const view = params.view || 'inbox';
    switch (view) {
      case 'unread':
        query.isRead = false;
        query.isTrash = false;
        query.isSpam = false;
        break;
      case 'starred':
        query.isStarred = true;
        query.isTrash = false;
        query.isSpam = false;
        break;
      case 'important':
        query.isImportant = true;
        query.isTrash = false;
        query.isSpam = false;
        break;
      case 'sent':
        query.labels = 'SENT';
        query.isTrash = false;
        query.isSpam = false;
        break;
      case 'archived':
        query.labels = { $nin: ['INBOX', 'TRASH', 'SPAM'] };
        query.isTrash = false;
        query.isSpam = false;
        break;
      case 'trash':
        query.isTrash = true;
        break;
      case 'spam':
        query.isSpam = true;
        break;
      case 'drafts':
        query.isDraft = true;
        break;
      case 'priority':
        query.priorityScore = { $gte: 70 };
        query.isTrash = false;
        query.isSpam = false;
        break;
      case 'inbox':
      default:
        query.labels = 'INBOX';
        query.isTrash = false;
        query.isSpam = false;
        break;
    }

    // Text search if query string is provided
    if (params.q && params.q.trim().length > 0) {
      query.$text = { $search: params.q.trim() };
    }

    const [emails, total] = await Promise.all([
      EmailMessage.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .select('-bodyHtml -attachments.attachmentId'),
      EmailMessage.countDocuments(query),
    ]);

    // If cache is completely empty for inbox view, auto-sync in background
    if (total === 0 && view === 'inbox' && !params.q) {
      this.syncGmailInbox(userId, params.accountId).catch(() => {});
    }

    return {
      emails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Retrieves single email message details
   */
  async getEmailById(userId: string, emailId: string): Promise<IEmailMessage> {
    const email = await EmailMessage.findOne({ _id: emailId, owner: userId });
    if (!email) {
      throw createError('Email message not found.', 404, 'EMAIL_NOT_FOUND');
    }
    return email;
  },

  /**
   * Retrieves entire conversation thread
   */
  async getThreadById(userId: string, threadId: string) {
    const messages = await EmailMessage.find({
      owner: userId,
      providerThreadId: threadId,
    }).sort({ date: 1 });

    if (messages.length === 0) {
      throw createError('Email thread not found.', 404, 'THREAD_NOT_FOUND');
    }

    const latest = messages[messages.length - 1];

    return {
      threadId,
      subject: latest.subject,
      snippet: latest.snippet,
      messages,
      messageCount: messages.length,
      isRead: messages.every((m) => m.isRead),
      isStarred: messages.some((m) => m.isStarred),
    };
  },

  /**
   * Toggles Star status on an email (and syncs to Gmail)
   */
  async toggleStar(userId: string, emailId: string): Promise<IEmailMessage> {
    const email = await this.getEmailById(userId, emailId);
    email.isStarred = !email.isStarred;
    await email.save();

    // Sync back to Gmail
    try {
      const accessToken = await accountService.getValidAccessToken(email.emailAccountId.toString());
      if (email.isStarred) {
        await gmailMessagesApi.modifyLabels(accessToken, email.providerMessageId, ['STARRED'], []);
      } else {
        await gmailMessagesApi.modifyLabels(accessToken, email.providerMessageId, [], ['STARRED']);
      }
    } catch (err: any) {
      logger.warn('Failed to sync star status to Gmail', { error: err.message });
    }

    return email;
  },

  /**
   * Marks email as read or unread (and syncs to Gmail)
   */
  async markRead(userId: string, emailId: string, isRead = true): Promise<IEmailMessage> {
    const email = await this.getEmailById(userId, emailId);
    email.isRead = isRead;
    await email.save();

    // Sync back to Gmail
    try {
      const accessToken = await accountService.getValidAccessToken(email.emailAccountId.toString());
      if (isRead) {
        await gmailMessagesApi.modifyLabels(accessToken, email.providerMessageId, [], ['UNREAD']);
      } else {
        await gmailMessagesApi.modifyLabels(accessToken, email.providerMessageId, ['UNREAD'], []);
      }
    } catch (err: any) {
      logger.warn('Failed to sync read status to Gmail', { error: err.message });
    }

    return email;
  },

  /**
   * Moves email to trash (and syncs to Gmail)
   */
  async trashEmail(userId: string, emailId: string): Promise<void> {
    const email = await this.getEmailById(userId, emailId);
    email.isTrash = true;
    await email.save();

    try {
      const accessToken = await accountService.getValidAccessToken(email.emailAccountId.toString());
      await gmailMessagesApi.trashMessage(accessToken, email.providerMessageId);
    } catch (err: any) {
      logger.warn('Failed to sync trash to Gmail', { error: err.message });
    }
  },

  /**
   * Archives an email by removing INBOX label
   */
  async archiveEmail(userId: string, emailId: string): Promise<void> {
    const email = await this.getEmailById(userId, emailId);
    email.labels = email.labels.filter((l) => l !== 'INBOX');
    await email.save();

    try {
      const accessToken = await accountService.getValidAccessToken(email.emailAccountId.toString());
      await gmailMessagesApi.modifyLabels(accessToken, email.providerMessageId, [], ['INBOX']);
    } catch (err: any) {
      logger.warn('Failed to sync archive to Gmail', { error: err.message });
    }
  },

  /**
   * Sends an outgoing email via Gmail API and records sent message
   */
  async sendEmail(
    userId: string,
    payload: {
      accountId?: string;
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      bodyText?: string;
      bodyHtml?: string;
      threadId?: string;
      attachments?: Array<{ filename: string; mimeType: string; contentBase64: string }>;
    }
  ) {
    let targetAccount;
    if (payload.accountId) {
      targetAccount = await accountService.getAccountById(userId, payload.accountId);
    } else {
      const accounts = await accountService.getAccountsForUser(userId);
      targetAccount = accounts.find((a) => a.isConnected);
    }

    if (!targetAccount) {
      throw createError('No connected email account found to send email.', 400, 'NO_CONNECTED_ACCOUNT');
    }

    const accessToken = await accountService.getValidAccessToken(targetAccount._id.toString());
    let sent: { id: string; threadId?: string };

    if (targetAccount.provider === 'outlook') {
      sent = await outlookMessagesApi.sendMessage(accessToken, {
        to: payload.to,
        cc: payload.cc,
        bcc: payload.bcc,
        subject: payload.subject,
        bodyText: payload.bodyText,
        bodyHtml: payload.bodyHtml,
      });
    } else {
      sent = await gmailSendApi.sendEmail(accessToken, {
        to: payload.to,
        cc: payload.cc,
        bcc: payload.bcc,
        subject: payload.subject,
        bodyText: payload.bodyText,
        bodyHtml: payload.bodyHtml,
        threadId: payload.threadId,
        attachments: payload.attachments,
      });
    }

    // Save sent message in local database
    const saved = await EmailMessage.create({
      owner: userId,
      emailAccountId: targetAccount._id,
      provider: targetAccount.provider || 'gmail',
      providerMessageId: sent.id,
      providerThreadId: sent.threadId || sent.id,
      from: { name: targetAccount.email.split('@')[0] || '', email: targetAccount.email },
      to: payload.to.map((e) => ({ name: '', email: e })),
      cc: (payload.cc || []).map((e) => ({ name: '', email: e })),
      bcc: (payload.bcc || []).map((e) => ({ name: '', email: e })),
      subject: payload.subject,
      snippet: payload.bodyText?.slice(0, 120) || '',
      bodyText: payload.bodyText || '',
      bodyHtml: payload.bodyHtml || '',
      date: new Date(),
      isRead: true,
      isStarred: false,
      isImportant: false,
      isDraft: false,
      isTrash: false,
      isSpam: false,
      labels: ['SENT'],
    });

    logger.info('Email sent and recorded', {
      userId,
      messageId: sent.id,
      to: payload.to,
    });

    return saved;
  },

  /**
   * Synchronizes all connected accounts for a user in parallel
   */
  async syncAllAccounts(userId: string): Promise<{ totalSynced: number; accountsSynced: number }> {
    const accounts = await accountService.getAccountsForUser(userId);
    const connectedAccounts = accounts.filter((a) => a.isConnected);

    if (connectedAccounts.length === 0) {
      return { totalSynced: 0, accountsSynced: 0 };
    }

    const results = await Promise.allSettled(
      connectedAccounts.map((acc) => emailService.syncGmailInbox(userId, acc._id.toString()))
    );

    let totalSynced = 0;
    let accountsSynced = 0;

    results.forEach((res) => {
      if (res.status === 'fulfilled') {
        totalSynced += res.value.syncedCount;
        accountsSynced++;
      }
    });

    logger.info('Sync all accounts completed', { userId, totalSynced, accountsSynced });
    return { totalSynced, accountsSynced };
  },

  /**
   * Exports an entire email thread as .EML RFC 2822 format or structured JSON
   */
  async exportThread(
    userId: string,
    threadId: string,
    format: 'eml' | 'json' = 'eml'
  ): Promise<{ content: string; contentType: string; filename: string }> {
    const messages = await EmailMessage.find({
      owner: userId,
      providerThreadId: threadId,
    }).sort({ date: 1 });

    if (!messages || messages.length === 0) {
      throw createError('Thread not found or has no messages.', 404, 'THREAD_NOT_FOUND');
    }

    const subject = messages[0].subject || 'conversation';
    const sanitizedSubject = subject.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);

    if (format === 'json') {
      const data = {
        threadId,
        subject,
        messageCount: messages.length,
        exportedAt: new Date().toISOString(),
        messages: messages.map((m) => ({
          messageId: m.providerMessageId,
          from: m.from,
          to: m.to,
          cc: m.cc,
          bcc: m.bcc,
          subject: m.subject,
          date: m.date,
          snippet: m.snippet,
          bodyText: m.bodyText,
          bodyHtml: m.bodyHtml,
          labels: m.labels,
          isStarred: m.isStarred,
          isImportant: m.isImportant,
          priorityScore: m.priorityScore,
        })),
      };

      return {
        content: JSON.stringify(data, null, 2),
        contentType: 'application/json',
        filename: `${sanitizedSubject}_thread_${threadId}.json`,
      };
    }

    // Default: Build RFC 2822 .EML format combining the conversation messages
    let eml = `From: ${messages[0].from?.name ? `"${messages[0].from.name}" <${messages[0].from.email}>` : messages[0].from?.email}\r\n`;
    eml += `To: ${messages[0].to?.map((t) => t.email).join(', ')}\r\n`;
    if (messages[0].cc?.length) eml += `Cc: ${messages[0].cc.map((c) => c.email).join(', ')}\r\n`;
    eml += `Subject: ${subject}\r\n`;
    eml += `Date: ${new Date(messages[0].date).toUTCString()}\r\n`;
    eml += `MIME-Version: 1.0\r\n`;
    eml += `X-Thread-ID: ${threadId}\r\n`;
    eml += `X-Total-Messages: ${messages.length}\r\n`;
    eml += `Content-Type: text/plain; charset=UTF-8\r\n\r\n`;

    messages.forEach((m, idx) => {
      eml += `--------------------------------------------------\r\n`;
      eml += `Message #${idx + 1} of ${messages.length}\r\n`;
      eml += `From: ${m.from?.name || ''} <${m.from?.email || ''}>\r\n`;
      eml += `Date: ${new Date(m.date).toLocaleString()}\r\n`;
      eml += `--------------------------------------------------\r\n\r\n`;
      eml += `${m.bodyText || m.snippet || ''}\r\n\r\n`;
    });

    return {
      content: eml,
      contentType: 'message/rfc822',
      filename: `${sanitizedSubject}_thread_${threadId}.eml`,
    };
  },
};
