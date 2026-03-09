import { Request, Response, NextFunction } from 'express';

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Доступ запрещён' });
    return;
  }
  next();
}

export default adminMiddleware;
