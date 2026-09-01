import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All AI endpoints require application authentication
router.use(authenticate);

router.post('/summarize', aiController.summarize);
router.post('/explain', aiController.explain);
router.post('/generate-reply', aiController.generateReply);
router.post('/rewrite', aiController.rewriteDraft);
router.post('/subject-lines', aiController.generateSubjectLines);
router.post('/security-check', aiController.securityCheck);
router.post('/extract-actions', aiController.extractActions);

export default router;
