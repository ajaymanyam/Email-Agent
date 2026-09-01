import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { actionItemService } from '../services/actionItemService';

export const actionItemController = {
  async listActionItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await actionItemService.listActionItems(req.user!.userId, {
        status: req.query.status as string,
        priority: req.query.priority as string,
        search: req.query.search as string,
      });
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  },

  async createActionItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await actionItemService.createActionItem(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },

  async updateActionItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const item = await actionItemService.updateActionItem(
        req.user!.userId,
        id,
        req.body
      );
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },

  async deleteActionItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await actionItemService.deleteActionItem(req.user!.userId, id);
      res.json({ success: true, message: 'Action item deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async extractFromEmail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const emailId = Array.isArray(req.params.emailId) ? req.params.emailId[0] : req.params.emailId;
      const items = await actionItemService.extractAndSaveFromEmail(
        req.user!.userId,
        emailId
      );
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  },

  async syncToCalendar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await actionItemService.syncToGoogleCalendar(req.user!.userId, id);
      res.json({ success: true, data: result, message: 'Event successfully created in Google Calendar.' });
    } catch (err) {
      next(err);
    }
  },
};
