import { Router } from 'express';
import { accountController } from '../controllers/accountController';
import { authenticate } from '../middleware/auth';

const router = Router();

// OAuth initiation requires authentication
router.get('/oauth/start', authenticate, accountController.startGmailOAuth);

// OAuth callback is called by Google's redirect; state parameter validates user
router.get('/oauth/callback', accountController.gmailOAuthCallback);

export default router;
