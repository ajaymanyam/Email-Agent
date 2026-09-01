import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware factory that runs a series of express-validator chains
 * and returns standard 400 response on validation failure.
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    const formattedErrors = errors.array().map((err) => ({
      field: (err as any).path || (err as any).param || 'unknown',
      message: err.msg,
    }));

    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request payload.',
      errors: formattedErrors,
    });
  };
};
