import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import type { AuthSessionPayload, UserRole } from './types.ts';

const TOKEN_TTL_SECONDS = 12 * 60 * 60; // 12 hours

// Keep signing secret strictly in memory if SESSION_SECRET env var is omitted
const SESSION_SECRET =
  process.env.SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHex] = parts;
  if (!salt || !originalHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const original = Buffer.from(originalHex, 'hex');
    if (derived.length !== original.length) return false;
    return crypto.timingSafeEqual(derived, original);
  } catch {
    return false;
  }
}

export function getEnvAdminPasscode(): string | null {
  const raw = process.env.ADMIN_PASSCODE?.trim();
  return raw ? raw : null;
}

export function verifyEnvAdminPasscode(candidate: string): boolean {
  const expected = getEnvAdminPasscode();
  if (!expected) return false;
  const candidateDigest = crypto.createHash('sha256').update(candidate).digest();
  const expectedDigest = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(candidateDigest, expectedDigest);
}

export function generateCaseToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

export function hashCaseToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyCaseToken(token: string, expectedHash: string): boolean {
  if (!token || !expectedHash) return false;
  try {
    const actual = Buffer.from(hashCaseToken(token), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    if (actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function signPayload(payloadB64: string): string {
  return crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');
}

export function createSessionToken(user: {
  sub: string;
  username: string;
  displayName: string;
  role: UserRole;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthSessionPayload = {
    sub: user.sub,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayload(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): AuthSessionPayload | null {
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return null;
  const payloadB64 = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (!payloadB64 || !sig) return null;

  const expectedSig = signPayload(payloadB64);
  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    ) as AuthSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!decoded || typeof decoded.exp !== 'number' || decoded.exp <= now) {
      return null;
    }
    if (decoded.role !== 'admin' && decoded.role !== 'responder') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function extractBearerUser(req: Request): AuthSessionPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  return verifySessionToken(token);
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthSessionPayload;
}

export function requireAuth(allowedRoles?: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = extractBearerUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      res.status(403).json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
      return;
    }
    req.authUser = user;
    next();
  };
}
