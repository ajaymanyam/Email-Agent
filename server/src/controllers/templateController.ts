import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { templateService } from '../services/templateService';

export const templateController = {
  async listTemplates(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const templates = await templateService.listTemplates(req.user!.userId, {
        category: req.query.category as string,
        search: req.query.search as string,
        favorite: req.query.favorite === 'true',
      });
      res.json({ success: true, data: templates });
    } catch (err) {
      next(err);
    }
  },

  async getTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const template = await templateService.getTemplateById(req.user!.userId, id);
      res.json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  },

  async createTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const template = await templateService.createTemplate(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  },

  async updateTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const template = await templateService.updateTemplate(
        req.user!.userId,
        id,
        req.body
      );
      res.json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  },

  async deleteTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await templateService.deleteTemplate(req.user!.userId, id);
      res.json({ success: true, message: 'Template deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async useTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const template = await templateService.incrementUsage(req.user!.userId, id);
      res.json({ success: true, data: template });
    } catch (err) {
      next(err);
    }
  },
};
