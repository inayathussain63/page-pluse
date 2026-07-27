import { z } from 'zod';

export const auditSchema = z.object({
  url: z
    .string({
      required_error: 'URL is required',
    })
    .trim()
    .min(1, 'URL cannot be empty')
    .refine(
      (val) => {
        try {
          const formatted = /^https?:\/\//i.test(val) ? val : `https://${val}`;
          const parsed = new URL(formatted);
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
          const host = parsed.hostname;
          if (!host || host.includes(' ') || host.endsWith('.')) return false;
          // Valid domain check (must contain valid tld or localhost)
          if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(host) && host !== 'localhost') return false;
          return true;
        } catch {
          return false;
        }
      },
      {
        message: 'Invalid URL format. Must be a valid HTTP or HTTPS web address',
      }
    ),
});

export const normalizeUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

