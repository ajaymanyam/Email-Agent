import { Router } from 'express';
import { emailController } from '../controllers/emailController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All email routes require JWT authentication
router.use(authenticate);

// Sync emails from Gmail/Outlook provider
router.post('/sync', emailController.syncInbox);
router.post('/sync-all', emailController.syncAll);

// Email list & search
router.get('/', emailController.listEmails);

// Email thread view & export
router.get('/threads/:threadId/export', emailController.exportThread);
router.get('/threads/:threadId', emailController.getThread);

// Single email message
router.get('/:id', emailController.getEmail);

// Email state modifications (Star, Read/Unread, Archive, Trash)
router.post('/:id/star', emailController.toggleStar);
router.post('/:id/read', emailController.markRead);
router.post('/:id/archive', emailController.archiveEmail);
router.post('/:id/trash', emailController.trashEmail);

// Send email
router.post('/send', emailController.sendEmail);

export default router;
