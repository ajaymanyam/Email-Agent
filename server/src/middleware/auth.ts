import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: JwtPayload & { _id: string };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    const token = authHeader.slice(7);
    let payload: JwtPayload;

    try {
      payload = verifyToken(token);
    } catch {
      res.status(401).json({
        success: false,
        code: 'AUTH_INVALID',
        message: 'Your session is invalid or has expired. Please log in again.',
      });
      return;
    }

    // Verify user still exists in DB
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      res.status(401).json({
        success: false,
        code: 'AUTH_INVALID',
        message: 'User account not found. Please log in again.',
      });
      return;
    }

    req.user = { ...payload, _id: user._id.toString() };
    next();
  } catch (error) {
    logger.error('Authentication middleware error', { error });
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred.',
    });
  }
}
