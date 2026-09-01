import { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/authService';
import { validate } from '../middleware/validation';
import { AuthRequest } from '../middleware/auth';

// ── Validators ──────────────────────────────────────────────────────────────

export const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  validate,
];

export const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

export const updateProfileValidators = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('preferences.defaultTone').optional().isIn(['professional', 'friendly', 'formal', 'concise']),
  body('preferences.theme').optional().isIn(['light', 'dark', 'system']),
  body('preferences.emailsPerPage').optional().isInt({ min: 5, max: 100 }),
  body('preferences.autoSummarize').optional().isBoolean(),
  body('preferences.notificationsEnabled').optional().isBoolean(),
  validate,
];

// ── Controllers ──────────────────────────────────────────────────────────────

export const authController = {
  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body as { name: string; email: string; password: string };
      const result = await authService.register({ name, email, password });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const result = await authService.login({ email, password });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: AuthRequest, res: Response): Promise<void> {
    // JWT is stateless; client discards token. Log the event server-side if needed.
    res.json({ success: true, message: 'Logged out successfully.' });
  },

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body as { name?: string; preferences?: Record<string, unknown> });
      res.json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  },

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.deleteAccount(req.user!.userId);
      res.json({ success: true, message: 'Account deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },
};
