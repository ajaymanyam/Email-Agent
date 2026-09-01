import { Router } from 'express';
import { accountController } from '../controllers/accountController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public OAuth callback from Microsoft redirect
router.get('/outlook/callback', accountController.outlookOAuthCallback);

// Protected routes require JWT authentication
router.use(authenticate);

router.get('/outlook/start', accountController.startOutlookOAuth);
router.get('/', accountController.listAccounts);
router.get('/:id', accountController.getAccount);
router.get('/:id/status', accountController.getAccountStatus);
router.post('/:id/disconnect', accountController.disconnectAccount);

export default router;
