import rateLimit from 'express-rate-limit';

export const auditRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 60, // Limit each IP to 60 audit requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many audit requests from this IP. Please try again after 15 minutes.',
  },
});
