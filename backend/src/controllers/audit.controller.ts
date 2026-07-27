import { Request, Response, NextFunction } from 'express';
import { auditSchema } from '../validators/audit.validator';
import { auditService } from '../services/audit.service';

export const auditController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Input Validation with Zod
    const validationResult = auditSchema.safeParse(req.body);

    if (!validationResult.success) {
      const issue = validationResult.error.errors[0];
      res.status(400).json({
        success: false,
        error: issue ? issue.message : 'Invalid URL',
      });
      return;
    }

    const { url } = validationResult.data;

    // 2. Perform Web Audit
    const result = await auditService.auditUrl(url);

    // 3. Return Successful Response
    res.status(200).json(result);
  } catch (error: any) {
    const statusCode = typeof error?.statusCode === 'number' ? error.statusCode : 500;
    const errorMessage = error?.message || 'Failed to complete audit for this URL';

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
};

