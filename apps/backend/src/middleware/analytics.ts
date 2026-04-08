import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import prisma from '../utils/prisma';
import { AuthRequest } from './auth';
import { verifyAccessToken } from '../utils/jwt';

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.JWT_SECRET || 'salt')).digest('hex').slice(0, 16);
}

export function analyticsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only track GET requests to frontend-visible paths
  if (req.method !== 'GET' || req.path.startsWith('/uploads')) {
    return next();
  }

  const authReq = req as AuthRequest;
  let userId: string | undefined;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.slice(7));
      userId = payload.userId;
    } catch {
      // ignore
    }
  }

  const ip = (req.ip || '').replace('::ffff:', '');
  const ipHash = ip ? hashIp(ip) : undefined;

  // Fire and forget - don't await
  prisma.pageView.create({
    data: {
      path: req.path,
      userId: userId || null,
      ipHash: ipHash || null,
      userAgent: req.headers['user-agent']?.slice(0, 255) || null,
    },
  }).catch(() => {});

  next();
}
