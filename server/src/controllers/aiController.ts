import { Response, NextFunction } from 'express';
import { aiService } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';

export const aiController = {
  async summarize(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, subject } = req.body;
      const result = await aiService.summarizeEmail(content || '', subject || '');
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async explain(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content } = req.body;
      const result = await aiService.explainEmail(content || '');
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async generateReply(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, tone, instructions } = req.body;
      const result = await aiService.generateReply(content || '', tone, instructions);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async rewriteDraft(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { draft, goal } = req.body;
      const result = await aiService.rewriteDraft(draft || '', goal);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async generateSubjectLines(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { draft } = req.body;
      const suggestions = await aiService.generateSubjectLines(draft || '');
      res.json({ success: true, data: { suggestions } });
    } catch (err) {
      next(err);
    }
  },

  async securityCheck(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sender, subject, body } = req.body;
      const result = await aiService.analyzeSecurity({
        sender: sender || '',
        subject: subject || '',
        body: body || '',
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async extractActions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content } = req.body;
      const actionItems = await aiService.extractActionItems(content || '');
      res.json({ success: true, data: { actionItems } });
    } catch (err) {
      next(err);
    }
  },
};
