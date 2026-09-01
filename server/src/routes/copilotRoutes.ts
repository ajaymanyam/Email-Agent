import { Router } from 'express';
import { body } from 'express-validator';
import { copilotController } from '../controllers/copilotController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

// AI Auto-Drafts
router.post('/generate-drafts', aiLimiter, copilotController.generateDrafts);
router.get('/drafts', copilotController.getDrafts);
router.post('/drafts/:id/accept', copilotController.acceptDraft);
router.post('/drafts/:id/discard', copilotController.discardDraft);

// Scheduled Sends
router.get('/scheduled', copilotController.getScheduled);
router.post(
  '/schedule',
  validate([
    body('to').isArray({ min: 1 }).withMessage('At least one recipient email is required.'),
    body('subject').isString().notEmpty().withMessage('Subject is required.'),
    body('scheduledFor').isISO8601().withMessage('Valid ISO8601 scheduled date is required.'),
  ]),
  copilotController.scheduleEmail
);
router.delete('/scheduled/:id', copilotController.cancelScheduled);

// Natural Language AI Search
router.post(
  '/nl-search',
  aiLimiter,
  validate([body('q').isString().notEmpty().withMessage('Query string (q) is required.')]),
  copilotController.nlSearch
);

export default router;
