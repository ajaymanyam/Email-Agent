import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ruleService } from '../services/ruleService';

export const ruleController = {
  async listRules(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rules = await ruleService.listRules(req.user!.userId);
      res.json({ success: true, data: rules });
    } catch (err) {
      next(err);
    }
  },

  async getRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const rule = await ruleService.getRuleById(req.user!.userId, id);
      res.json({ success: true, data: rule });
    } catch (err) {
      next(err);
    }
  },

  async createRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await ruleService.createRule(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: rule });
    } catch (err) {
      next(err);
    }
  },

  async updateRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const rule = await ruleService.updateRule(req.user!.userId, id, req.body);
      res.json({ success: true, data: rule });
    } catch (err) {
      next(err);
    }
  },

  async toggleRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { isEnabled } = req.body;
      const rule = await ruleService.toggleRule(req.user!.userId, id, !!isEnabled);
      res.json({ success: true, data: rule });
    } catch (err) {
      next(err);
    }
  },

  async deleteRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await ruleService.deleteRule(req.user!.userId, id);
      res.json({ success: true, message: 'Automation rule deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },
};
