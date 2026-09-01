import { Response, NextFunction } from 'express';
import { emailService } from '../services/emailService';
import { AuthRequest } from '../middleware/auth';

export const emailController = {
  /**
   * POST /api/emails/sync
   */
  async syncInbox(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountId } = req.body;
      const result = await emailService.syncGmailInbox(req.user!.userId, accountId);
      res.json({
        success: true,
        message: `Synced ${result.syncedCount} emails successfully.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/emails
   */
  async listEmails(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountId, view, q, page, limit } = req.query as any;

      const result = await emailService.listEmails(req.user!.userId, {
        accountId,
        view,
        q,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/emails/:id
   */
  async getEmail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = await emailService.getEmailById(
        req.user!.userId,
        req.params['id'] as string
      );
      res.json({ success: true, data: { email } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/emails/threads/:threadId
   */
  async getThread(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const thread = await emailService.getThreadById(
        req.user!.userId,
        req.params['threadId'] as string
      );
      res.json({ success: true, data: { thread } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/emails/:id/star
   */
  async toggleStar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = await emailService.toggleStar(
        req.user!.userId,
        req.params['id'] as string
      );
      res.json({
        success: true,
        data: { isStarred: email.isStarred },
        message: email.isStarred ? 'Email starred' : 'Email unstarred',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/emails/:id/read
   */
  async markRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isRead = true } = req.body;
      const email = await emailService.markRead(
        req.user!.userId,
        req.params['id'] as string,
        isRead
      );
      res.json({
        success: true,
        data: { isRead: email.isRead },
        message: isRead ? 'Marked as read' : 'Marked as unread',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/emails/:id/archive
   */
  async archiveEmail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await emailService.archiveEmail(
        req.user!.userId,
        req.params['id'] as string
      );
      res.json({ success: true, message: 'Email archived successfully.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/emails/:id/trash
   */
  async trashEmail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await emailService.trashEmail(
        req.user!.userId,
        req.params['id'] as string
      );
      res.json({ success: true, message: 'Email moved to trash.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/emails/send
   */
  async sendEmail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountId, to, cc, bcc, subject, bodyText, bodyHtml, threadId, attachments } = req.body;

      if (!to || !Array.isArray(to) || to.length === 0) {
        res.status(400).json({ success: false, message: 'Recipient email address (to) is required.' });
        return;
      }

      const email = await emailService.sendEmail(req.user!.userId, {
        accountId,
        to,
        cc,
        bcc,
        subject: subject || '(No Subject)',
        bodyText,
        bodyHtml,
        threadId,
        attachments,
      });

      res.status(201).json({
        success: true,
        message: 'Email sent successfully.',
        data: { email },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/emails/sync-all
   */
  async syncAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await emailService.syncAllAccounts(req.user!.userId);
      res.json({
        success: true,
        message: `Synced ${result.totalSynced} emails across ${result.accountsSynced} accounts.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/emails/threads/:threadId/export
   */
  async exportThread(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const format = req.query.format === 'json' ? 'json' : 'eml';
      const result = await emailService.exportThread(
        req.user!.userId,
        req.params['threadId'] as string,
        format
      );

      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Type', result.contentType);
      res.send(result.content);
    } catch (err) {
      next(err);
    }
  },
};
