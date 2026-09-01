import { AiDraft } from '../models/AiDraft';
import { ScheduledEmail } from '../models/ScheduledEmail';
import { EmailMessage } from '../models/EmailMessage';
import { emailService } from './emailService';
import { aiService } from './aiService';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export const copilotService = {
  /**
   * Generates AI draft replies for recent actionable incoming emails
   */
  async generateDraftsForUser(userId: string): Promise<number> {
    const candidateMessages = await EmailMessage.find({
      owner: userId,
      isTrash: false,
      isSpam: false,
      labels: { $ne: 'SENT' },
    })
      .sort({ date: -1 })
      .limit(10);

    let createdCount = 0;

    for (const msg of candidateMessages) {
      if (createdCount >= 5) break;

      const existing = await AiDraft.findOne({
        owner: userId,
        providerThreadId: msg.providerThreadId,
      });

      if (existing) continue;

      try {
        const prompt = `Context: The user received an email.\nFrom: ${msg.from.name || ''} <${msg.from.email}>\nSubject: ${msg.subject}\nBody:\n${msg.bodyText?.slice(0, 1500) || msg.snippet}\n\nTask: Draft a concise, courteous, professional reply that directly addresses the sender's message.`;

        const replyResult = await aiService.generateReply(prompt, 'Professional');
        const suggestedText = replyResult.replies?.[0]?.text || '';

        if (suggestedText) {
          await AiDraft.create({
            owner: userId,
            emailAccountId: msg.emailAccountId,
            emailMessageId: msg._id,
            providerThreadId: msg.providerThreadId,
            recipientEmail: msg.from.email,
            recipientName: msg.from.name || msg.from.email.split('@')[0],
            originalSubject: msg.subject,
            suggestedSubject: msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
            suggestedBody: suggestedText,
            tone: 'Professional',
            keyPointsCovered: ['Acknowledged message', 'Actionable response provided'],
            confidenceScore: 90,
            status: 'suggested',
          });
          createdCount++;
        }
      } catch (err: any) {
        logger.warn('Failed to generate draft for email', {
          userId,
          messageId: msg._id,
          error: err.message,
        });
      }
    }

    return createdCount;
  },

  /**
   * Retrieves pending suggested drafts
   */
  async getDrafts(userId: string) {
    // Attempt background generation for any un-drafted priority emails
    copilotService.generateDraftsForUser(userId).catch(() => {});

    return AiDraft.find({ owner: userId, status: 'suggested' })
      .sort({ createdAt: -1 })
      .limit(20);
  },

  /**
   * Accepts and sends a suggested draft
   */
  async acceptAndSendDraft(userId: string, draftId: string) {
    const draft = await AiDraft.findOne({ _id: draftId, owner: userId });
    if (!draft) {
      throw createError('Draft not found.', 404, 'DRAFT_NOT_FOUND');
    }

    const sent = await emailService.sendEmail(userId, {
      accountId: draft.emailAccountId.toString(),
      to: [draft.recipientEmail],
      subject: draft.suggestedSubject,
      bodyText: draft.suggestedBody,
      bodyHtml: `<div>${draft.suggestedBody.replace(/\n/g, '<br/>')}</div>`,
      threadId: draft.providerThreadId,
    });

    draft.status = 'accepted';
    await draft.save();

    logger.info('Copilot draft accepted and dispatched', { userId, draftId });
    return sent;
  },

  /**
   * Discards a suggested draft
   */
  async discardDraft(userId: string, draftId: string) {
    const draft = await AiDraft.findOneAndUpdate(
      { _id: draftId, owner: userId },
      { status: 'discarded' },
      { new: true }
    );
    if (!draft) {
      throw createError('Draft not found.', 404, 'DRAFT_NOT_FOUND');
    }
    return draft;
  },

  /**
   * Schedules an email to be sent at a future date
   */
  async scheduleEmail(
    userId: string,
    payload: {
      accountId?: string;
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      bodyText: string;
      bodyHtml?: string;
      scheduledFor: string | Date;
      threadId?: string;
    }
  ) {
    const scheduledDate = new Date(payload.scheduledFor);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      throw createError('Scheduled time must be in the future.', 400, 'INVALID_SCHEDULE_TIME');
    }

    const scheduled = await ScheduledEmail.create({
      owner: userId,
      emailAccountId: payload.accountId,
      to: payload.to,
      cc: payload.cc || [],
      bcc: payload.bcc || [],
      subject: payload.subject,
      bodyText: payload.bodyText,
      bodyHtml: payload.bodyHtml || `<div>${payload.bodyText.replace(/\n/g, '<br/>')}</div>`,
      providerThreadId: payload.threadId,
      scheduledFor: scheduledDate,
      status: 'pending',
    });

    logger.info('Email scheduled successfully', {
      userId,
      scheduledId: scheduled._id,
      scheduledFor: scheduledDate.toISOString(),
    });

    return scheduled;
  },

  /**
   * Retrieves pending scheduled emails
   */
  async getScheduledEmails(userId: string) {
    return ScheduledEmail.find({ owner: userId, status: 'pending' }).sort({
      scheduledFor: 1,
    });
  },

  /**
   * Cancels a scheduled email
   */
  async cancelScheduledEmail(userId: string, scheduledId: string) {
    const scheduled = await ScheduledEmail.findOneAndUpdate(
      { _id: scheduledId, owner: userId, status: 'pending' },
      { status: 'cancelled' },
      { new: true }
    );
    if (!scheduled) {
      throw createError('Scheduled email not found or already sent.', 404, 'NOT_FOUND');
    }
    return scheduled;
  },

  /**
   * Background queue worker: dispatches pending scheduled emails that are due
   */
  async dispatchDueScheduledEmails() {
    const now = new Date();
    const dueEmails = await ScheduledEmail.find({
      status: 'pending',
      scheduledFor: { $lte: now },
    }).limit(10);

    for (const item of dueEmails) {
      // Atomic lock to prevent race conditions and duplicate dispatch
      const locked = await ScheduledEmail.findOneAndUpdate(
        { _id: item._id, status: 'pending' },
        { status: 'processing' },
        { new: true }
      );
      if (!locked) continue;

      try {
        await emailService.sendEmail(locked.owner.toString(), {
          accountId: locked.emailAccountId.toString(),
          to: locked.to,
          cc: locked.cc,
          bcc: locked.bcc,
          subject: locked.subject,
          bodyText: locked.bodyText,
          bodyHtml: locked.bodyHtml,
          threadId: locked.providerThreadId,
        });

        locked.status = 'sent';
        locked.sentAt = new Date();
        await locked.save();

        logger.info('Scheduled email successfully dispatched', {
          scheduledId: locked._id,
          owner: locked.owner,
        });
      } catch (err: any) {
        locked.status = 'failed';
        locked.error = err.message || 'Dispatch error';
        await locked.save();
        logger.error('Failed to dispatch scheduled email', {
          scheduledId: locked._id,
          error: err.message,
        });
      }
    }
  },

  /**
   * Natural Language Search: converts plain English into structured MongoDB filters
   */
  async naturalLanguageSearch(userId: string, nlQuery: string) {
    try {
      const parsed = await aiService.parseSearchQuery(nlQuery);
      const baseQuery: any = { owner: userId, isTrash: false, isSpam: false };

      const terms = Array.isArray(parsed.keywords)
        ? parsed.keywords.filter((t) => t && t.length >= 2)
        : typeof parsed.keywords === 'string'
        ? [parsed.keywords]
        : [];

      // 1. Build keyword regex array
      const keywordRegex = terms.map((term) => ({
        $or: [
          { subject: { $regex: term, $options: 'i' } },
          { snippet: { $regex: term, $options: 'i' } },
          { bodyText: { $regex: term, $options: 'i' } },
          { 'from.name': { $regex: term, $options: 'i' } },
          { 'from.email': { $regex: term, $options: 'i' } },
        ],
      }));

      const query: any = { ...baseQuery };

      // Apply Sender filter
      if (parsed.sender && parsed.sender.trim()) {
        query.$or = [
          { 'from.name': { $regex: parsed.sender.trim(), $options: 'i' } },
          { 'from.email': { $regex: parsed.sender.trim(), $options: 'i' } },
        ];
      }

      // Apply Priority filter
      if (parsed.isUrgent) {
        query.priorityScore = { $gte: 60 };
      }

      // Apply Starred filter
      if (parsed.isStarred) {
        query.isStarred = true;
      }

      // Apply Unread filter
      if ((parsed as any).isUnread) {
        query.isRead = false;
      }

      // Apply Folder View filter
      if (parsed.view && parsed.view !== 'inbox' && parsed.view !== 'all') {
        if (parsed.view === 'starred') query.isStarred = true;
        if (parsed.view === 'sent') query.labels = 'SENT';
        if (parsed.view === 'trash') query.isTrash = true;
        if (parsed.view === 'spam') query.isSpam = true;
      }

      // If keywords exist, combine with $or
      if (keywordRegex.length > 0) {
        const flattenedOr = keywordRegex.flatMap((k) => k.$or);
        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: flattenedOr }];
          delete query.$or;
        } else {
          query.$or = flattenedOr;
        }
      }

      let results = await EmailMessage.find(query)
        .sort({ date: -1 })
        .limit(30)
        .select('-bodyHtml');

      // If strict filter yielded 0 results, retry with keyword-only search
      if (results.length === 0 && terms.length > 0) {
        results = await EmailMessage.find({
          owner: userId,
          isTrash: false,
          isSpam: false,
          $or: terms.flatMap((term) => [
            { subject: { $regex: term, $options: 'i' } },
            { snippet: { $regex: term, $options: 'i' } },
            { bodyText: { $regex: term, $options: 'i' } },
            { 'from.name': { $regex: term, $options: 'i' } },
            { 'from.email': { $regex: term, $options: 'i' } },
          ]),
        })
          .sort({ date: -1 })
          .limit(20)
          .select('-bodyHtml');
      }

      return {
        interpretedQuery: parsed,
        total: results.length,
        emails: results,
      };
    } catch {
      // Direct raw query search fallback
      const cleanWords = nlQuery
        .replace(/\b(find|search|show|emails|messages|from|about|with|the|and|all)\b/gi, '')
        .trim()
        .split(/\s+/)
        .filter((w) => w.length >= 2);

      const searchTerms = cleanWords.length > 0 ? cleanWords : [nlQuery.trim()];

      const fallbackEmails = await EmailMessage.find({
        owner: userId,
        isTrash: false,
        isSpam: false,
        $or: searchTerms.flatMap((term) => [
          { subject: { $regex: term, $options: 'i' } },
          { snippet: { $regex: term, $options: 'i' } },
          { bodyText: { $regex: term, $options: 'i' } },
          { 'from.name': { $regex: term, $options: 'i' } },
          { 'from.email': { $regex: term, $options: 'i' } },
        ]),
      })
        .sort({ date: -1 })
        .limit(20)
        .select('-bodyHtml');

      return {
        interpretedQuery: {
          keywords: searchTerms,
          explanation: `Direct text search for: "${nlQuery}"`,
        },
        total: fallbackEmails.length,
        emails: fallbackEmails,
      };
    }
  },
};
