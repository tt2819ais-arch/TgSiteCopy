import { Request, Response, NextFunction } from 'express';

const requests: Map<string, { count: number; resetAt: number }> = new Map();

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = requests.get(key);

    if (!entry || now > entry.resetAt) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      res.status(429).json({ success: false, error: 'Слишком много запросов' });
      return;
    }

    entry.count++;
    next();
  };
}

export default rateLimit;
