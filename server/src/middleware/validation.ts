import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed. Please check your input.',
      errors: errors.array().map((e) => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg,
      })),
    });
    return;
  }
  next();
}
