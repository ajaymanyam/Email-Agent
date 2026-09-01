import mongoose from 'mongoose';
import axios from 'axios';
import { ActionItem, IActionItem, TaskPriority, TaskStatus } from '../models/ActionItem';
import { EmailMessage } from '../models/EmailMessage';
import { aiService } from './aiService';
import { accountService } from './accountService';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface ActionItemFilterOptions {
  status?: string;
  priority?: string;
  search?: string;
}

export const actionItemService = {
  /**
   * Retrieves user action items with flexible filtering & search
   */
  async listActionItems(userId: string, options: ActionItemFilterOptions = {}): Promise<IActionItem[]> {
    const filter: Record<string, any> = { owner: new mongoose.Types.ObjectId(userId) };

    if (options.status && options.status !== 'all') {
      filter.status = options.status;
    }

    if (options.priority && options.priority !== 'all') {
      filter.priority = options.priority;
    }

    if (options.search) {
      filter.task = { $regex: options.search, $options: 'i' };
    }

    return ActionItem.find(filter).sort({ priority: -1, deadline: 1, createdAt: -1 }).lean() as any;
  },

  /**
   * Creates a new manual action item
   */
  async createActionItem(
    userId: string,
    payload: {
      task: string;
      assignee?: string;
      deadline?: string | Date;
      priority?: TaskPriority;
      sourceEmailSubject?: string;
      sourceEmailSender?: string;
      emailId?: string;
      threadId?: string;
    }
  ): Promise<IActionItem> {
    if (!payload.task || !payload.task.trim()) {
      throw createError('Task description is required.', 400, 'INVALID_TASK_DESCRIPTION');
    }

    const doc: any = {
      owner: new mongoose.Types.ObjectId(userId),
      task: payload.task.trim(),
      assignee: payload.assignee?.trim() || '',
      priority: payload.priority || 'medium',
      status: 'pending',
      sourceEmailSubject: payload.sourceEmailSubject || '',
      sourceEmailSender: payload.sourceEmailSender || '',
    };

    if (payload.deadline) {
      const d = new Date(payload.deadline);
      if (!isNaN(d.getTime())) {
        doc.deadline = d;
      }
    }
    if (payload.emailId) {
      doc.emailId = new mongoose.Types.ObjectId(payload.emailId);
    }
    if (payload.threadId) {
      doc.threadId = payload.threadId;
    }

    const item = await ActionItem.create(doc);
    logger.info('Action item created', { userId, taskId: item._id.toString() });
    return item;
  },

  /**
   * Updates an action item (status, priority, deadline, task text)
   */
  async updateActionItem(
    userId: string,
    itemId: string,
    updates: Partial<{
      task: string;
      status: TaskStatus;
      priority: TaskPriority;
      deadline: string | Date | null;
      assignee: string;
    }>
  ): Promise<IActionItem> {
    const item = await ActionItem.findOne({
      _id: new mongoose.Types.ObjectId(itemId),
      owner: new mongoose.Types.ObjectId(userId),
    });
    if (!item) {
      throw createError('Action item not found.', 404, 'ACTION_ITEM_NOT_FOUND');
    }

    if (updates.task !== undefined) item.task = updates.task.trim();
    if (updates.status !== undefined) item.status = updates.status;
    if (updates.priority !== undefined) item.priority = updates.priority;
    if (updates.assignee !== undefined) item.assignee = updates.assignee.trim();
    if (updates.deadline !== undefined) {
      if (updates.deadline) {
        const d = new Date(updates.deadline);
        item.deadline = !isNaN(d.getTime()) ? d : undefined;
      } else {
        item.deadline = undefined;
      }
    }

    await item.save();
    return item;
  },

  /**
   * Deletes an action item
   */
  async deleteActionItem(userId: string, itemId: string): Promise<void> {
    const result = await ActionItem.deleteOne({
      _id: new mongoose.Types.ObjectId(itemId),
      owner: new mongoose.Types.ObjectId(userId),
    });
    if (result.deletedCount === 0) {
      throw createError('Action item not found.', 404, 'ACTION_ITEM_NOT_FOUND');
    }
  },

  /**
   * AI-extracts action items from an email and persists them
   */
  async extractAndSaveFromEmail(userId: string, emailId: string): Promise<IActionItem[]> {
    const email = await EmailMessage.findOne({
      _id: new mongoose.Types.ObjectId(emailId),
      owner: new mongoose.Types.ObjectId(userId),
    });
    if (!email) {
      throw createError('Email not found.', 404, 'EMAIL_NOT_FOUND');
    }

    const emailContent = `${email.subject}\n\n${email.bodyText || email.snippet}`;
    const rawItems = await aiService.extractActionItems(emailContent);

    if (!rawItems || rawItems.length === 0) {
      return [];
    }

    const createdItems: IActionItem[] = [];

    for (const raw of rawItems) {
      const exists = await ActionItem.findOne({
        owner: new mongoose.Types.ObjectId(userId),
        emailId: email._id,
        task: raw.task.trim(),
      });

      if (!exists) {
        let parsedDeadline: Date | undefined = undefined;
        if (raw.deadline) {
          const d = new Date(raw.deadline);
          if (!isNaN(d.getTime())) parsedDeadline = d;
        }

        const doc: any = {
          owner: new mongoose.Types.ObjectId(userId),
          emailId: email._id,
          emailAccountId: email.emailAccountId,
          threadId: email.providerThreadId,
          task: raw.task.trim(),
          assignee: raw.assignee?.trim() || '',
          priority: (['high', 'medium', 'low'].includes(raw.priority) ? raw.priority : 'medium') as TaskPriority,
          status: 'pending',
          sourceEmailSubject: email.subject || '(No Subject)',
          sourceEmailSender: email.from?.name || email.from?.email || '',
        };

        if (parsedDeadline) {
          doc.deadline = parsedDeadline;
        }

        const item = await ActionItem.create(doc);
        createdItems.push(item);
      }
    }

    logger.info('Action items extracted from email', {
      userId,
      emailId,
      count: createdItems.length,
    });

    return createdItems;
  },

  /**
   * Creates a Google Calendar event for an action item after explicit user confirmation
   */
  async syncToGoogleCalendar(userId: string, itemId: string): Promise<{ eventId: string; htmlLink: string }> {
    const item = await ActionItem.findOne({
      _id: new mongoose.Types.ObjectId(itemId),
      owner: new mongoose.Types.ObjectId(userId),
    });
    if (!item) {
      throw createError('Action item not found.', 404, 'ACTION_ITEM_NOT_FOUND');
    }

    const accounts = await accountService.getAccountsForUser(userId);
    const googleAccount = accounts.find((a) => a.provider === 'gmail' && a.isConnected);
    if (!googleAccount) {
      throw createError('Connected Google account required for Calendar sync.', 400, 'NO_GOOGLE_ACCOUNT');
    }

    const accessToken = await accountService.getValidAccessToken(googleAccount._id.toString());
    const startTime = item.deadline ? new Date(item.deadline) : new Date(Date.now() + 3600000);
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 min duration

    const eventPayload = {
      summary: `[Action Item] ${item.task}`,
      description: `Task extracted from email: ${item.sourceEmailSubject || 'N/A'}\nSender: ${item.sourceEmailSender || 'N/A'}`,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
      reminders: {
        useDefault: true,
      },
    };

    const res = await axios.post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      eventPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    item.calendarEventId = res.data.id;
    await item.save();

    logger.info('Google Calendar event created for action item', {
      userId,
      itemId,
      eventId: res.data.id,
    });

    return { eventId: res.data.id, htmlLink: res.data.htmlLink || '' };
  },
};
