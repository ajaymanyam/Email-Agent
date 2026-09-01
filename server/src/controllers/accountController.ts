import { Response, NextFunction } from 'express';
import { accountService } from '../services/accountService';
import { AuthRequest } from '../middleware/auth';
import { env } from '../config/env';

export const accountController = {
  /**
   * GET /api/gmail/oauth/start
   */
  async startGmailOAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const url = accountService.getGoogleAuthUrl(req.user!.userId);
      // Support both direct browser redirect and JSON API response
      if (req.headers.accept?.includes('text/html')) {
        res.redirect(url);
      } else {
        res.json({ success: true, data: { url } });
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/gmail/oauth/callback
   */
  async gmailOAuthCallback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, state, error } = req.query as {
        code?: string;
        state?: string;
        error?: string;
      };

      if (error) {
        res.redirect(`${env.CLIENT_URL}/accounts?error=${encodeURIComponent(error)}`);
        return;
      }

      if (!code || !state) {
        res.redirect(`${env.CLIENT_URL}/accounts?error=missing_oauth_params`);
        return;
      }

      await accountService.handleGoogleCallback(code, state);
      res.redirect(`${env.CLIENT_URL}/accounts?status=connected`);
    } catch (err: any) {
      const errorMessage = err.message || 'OAuth authentication failed';
      res.redirect(`${env.CLIENT_URL}/accounts?error=${encodeURIComponent(errorMessage)}`);
    }
  },

  /**
   * GET /api/accounts/outlook/start
   */
  async startOutlookOAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const url = accountService.getMicrosoftAuthUrl(req.user!.userId);
      if (req.headers.accept?.includes('text/html')) {
        res.redirect(url);
      } else {
        res.json({ success: true, data: { url } });
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/accounts/outlook/callback
   */
  async outlookOAuthCallback(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, state, error } = req.query as {
        code?: string;
        state?: string;
        error?: string;
      };

      if (error) {
        res.redirect(`${env.CLIENT_URL}/accounts?error=${encodeURIComponent(error)}`);
        return;
      }

      if (!code || !state) {
        res.redirect(`${env.CLIENT_URL}/accounts?error=missing_oauth_params`);
        return;
      }

      await accountService.handleMicrosoftCallback(code, state);
      res.redirect(`${env.CLIENT_URL}/accounts?status=connected`);
    } catch (err: any) {
      const errorMessage = err.message || 'Outlook OAuth authentication failed';
      res.redirect(`${env.CLIENT_URL}/accounts?error=${encodeURIComponent(errorMessage)}`);
    }
  },

  /**
   * GET /api/accounts
   */
  async listAccounts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const accounts = await accountService.getAccountsForUser(req.user!.userId);
      res.json({ success: true, data: { accounts } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/accounts/:id
   */
  async getAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const account = await accountService.getAccountById(
        req.user!.userId,
        req.params['id'] as string
      );
      res.json({ success: true, data: { account } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/accounts/:id/status
   */
  async getAccountStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await accountService.getAccountStatus(
        req.user!.userId,
        req.params['id'] as string
      );
      res.json({ success: true, data: { status } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/accounts/:id/disconnect
   */
  async disconnectAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await accountService.disconnectAccount(
        req.user!.userId,
        req.params['id'] as string
      );
      res.json({ success: true, message: 'Account disconnected successfully.' });
    } catch (err) {
      next(err);
    }
  },
};
