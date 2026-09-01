import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analyticsService';

export const analyticsController = {
  async getOverview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string, 10) || 30;
      const data = await analyticsService.getOverview(req.user!.userId, days);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getVolumeTrends(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string, 10) || 14;
      const data = await analyticsService.getVolumeTrends(req.user!.userId, days);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getTopContacts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 6;
      const data = await analyticsService.getTopContacts(req.user!.userId, limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getProductivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getProductivityInsights(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
