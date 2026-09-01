import { Router } from 'express';
import {
  authController,
  registerValidators,
  loginValidators,
  updateProfileValidators,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (rate-limited)
router.post('/register', authLimiter, ...registerValidators, authController.register);
router.post('/login', authLimiter, ...loginValidators, authController.login);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, ...updateProfileValidators, authController.updateProfile);
router.delete('/account', authenticate, authController.deleteAccount);

export default router;
