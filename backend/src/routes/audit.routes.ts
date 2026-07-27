import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { auditRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/audit
router.post('/audit', auditRateLimiter, auditController);

export default router;
