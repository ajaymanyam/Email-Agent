import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All analytics routes require JWT authentication
router.use(authenticate);

router.get('/overview', analyticsController.getOverview);
router.get('/volume', analyticsController.getVolumeTrends);
router.get('/contacts', analyticsController.getTopContacts);
router.get('/productivity', analyticsController.getProductivity);

export default router;
