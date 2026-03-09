import jwt from 'jsonwebtoken';
import env from '../../config/env';
import type { JwtPayload } from '../../types';
import type { IncomingMessage } from 'http';

export function authenticateWs(request: IncomingMessage): JwtPayload | null {
  try {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) return null;

    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

export default authenticateWs;
