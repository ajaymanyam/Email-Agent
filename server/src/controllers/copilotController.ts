import { Response, NextFunction } from 'express';
import { copilotService } from '../services/copilotService';
import { AuthRequest } from '../middleware/auth';

export const copilotController = {
  /**
   * POST /api/copilot/generate-drafts
   */
  async generateDrafts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await copilotService.generateDraftsForUser(req.user!.userId);
      const drafts = await copilotService.getDrafts(req.user!.userId);
      res.json({
        success: true,
        message: count > 0 ? `Generated ${count} new AI draft replies!` : 'All actionable emails already have drafts.',
        data: { createdCount: count, drafts },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/copilot/drafts
   */
  async getDrafts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const drafts = await copilotService.getDrafts(req.user!.userId);
      res.json({ success: true, data: { drafts } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/copilot/drafts/:id/accept
   */
  async acceptDraft(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sent = await copilotService.acceptAndSendDraft(
        req.user!.userId,
        req.params['id'] as string
      );
      res.json({ success: true, message: 'AI draft dispatched successfully!', data: { email: sent } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/copilot/drafts/:id/discard
   */
  async discardDraft(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await copilotService.discardDraft(req.user!.userId, req.params['id'] as string);
      res.json({ success: true, message: 'Draft dismissed.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/copilot/schedule
   */
  async scheduleEmail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const scheduled = await copilotService.scheduleEmail(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: `Email scheduled for ${new Date(scheduled.scheduledFor).toLocaleString()}.`,
        data: { scheduled },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/copilot/scheduled
   */
  async getScheduled(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const scheduled = await copilotService.getScheduledEmails(req.user!.userId);
      res.json({ success: true, data: { scheduled } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/copilot/scheduled/:id
   */
  async cancelScheduled(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await copilotService.cancelScheduledEmail(
        req.user!.userId,
        req.params['id'] as string
      );
      res.json({ success: true, message: 'Scheduled delivery cancelled.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/copilot/nl-search
   */
  async nlSearch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.body;
      if (!q || typeof q !== 'string') {
        res.status(400).json({ success: false, message: 'Search query (q) is required.' });
        return;
      }
      const results = await copilotService.naturalLanguageSearch(req.user!.userId, q);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  },
};
