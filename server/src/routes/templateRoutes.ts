import { Router } from 'express';
import { templateController } from '../controllers/templateController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All template routes require JWT authentication
router.use(authenticate);

router.get('/', templateController.listTemplates);
router.post('/', templateController.createTemplate);
router.get('/:id', templateController.getTemplate);
router.patch('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);
router.post('/:id/use', templateController.useTemplate);

export default router;
