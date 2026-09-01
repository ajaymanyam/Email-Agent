import { Router } from 'express';
import { ruleController } from '../controllers/ruleController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All rule routes require JWT authentication
router.use(authenticate);

router.get('/', ruleController.listRules);
router.post('/', ruleController.createRule);
router.get('/:id', ruleController.getRule);
router.patch('/:id', ruleController.updateRule);
router.patch('/:id/toggle', ruleController.toggleRule);
router.delete('/:id', ruleController.deleteRule);

export default router;
