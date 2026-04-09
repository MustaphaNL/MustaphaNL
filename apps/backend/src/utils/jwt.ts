import jwt from 'jsonwebtoken';

function requireEnv(name: string, fallback: string): string {
  const val = process.env[name];
  if (val) return val;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`FATAL: Required environment variable ${name} is not set. Cannot start in production without it.`);
  }
  console.warn(`WARNING: ${name} not set, using insecure default. Set it before deploying to production.`);
  return fallback;
}

const JWT_SECRET = requireEnv('JWT_SECRET', 'dev_secret_DO_NOT_USE_IN_PRODUCTION');
const JWT_REFRESH_SECRET = requireEnv('JWT_REFRESH_SECRET', 'dev_refresh_DO_NOT_USE_IN_PRODUCTION');

export interface TokenPayload {
  userId: string;
  isAdmin: boolean;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
