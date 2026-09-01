import { Router } from 'express';
import { actionItemController } from '../controllers/actionItemController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All action items routes require JWT authentication
router.use(authenticate);

router.get('/', actionItemController.listActionItems);
router.post('/', actionItemController.createActionItem);
router.patch('/:id', actionItemController.updateActionItem);
router.delete('/:id', actionItemController.deleteActionItem);
router.post('/:id/calendar', actionItemController.syncToCalendar);
router.post('/extract/:emailId', actionItemController.extractFromEmail);

export default router;
