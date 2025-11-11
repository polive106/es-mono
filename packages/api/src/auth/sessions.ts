import { db } from '@es-mono/database';
import { randomUUID } from 'crypto';
import type { ISessionRepository } from '../repositories/interfaces';
import { DrizzleSessionRepository } from '../repositories/implementations';

const SESSION_TIMEOUT_TALENT = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_TIMEOUT_MANAGER = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Create a new session for a user (internal implementation with dependency injection)
 */
export async function createSessionInternal(
  userId: string,
  options: { isTalent?: boolean } | undefined,
  sessionRepo: ISessionRepository
) {
  const sessionId = randomUUID();
  const timeout = options?.isTalent ? SESSION_TIMEOUT_TALENT : SESSION_TIMEOUT_MANAGER;
  const expiresAt = new Date(Date.now() + timeout);

  await sessionRepo.create({
    id: sessionId,
    userId,
    expiresAt,
  });

  return {
    id: sessionId,
    userId,
    expiresAt,
    fresh: true,
  };
}

/**
 * Create a new session for a user (backward compatible wrapper)
 */
export async function createSession(userId: string, options?: { isTalent?: boolean }) {
  const sessionRepo = new DrizzleSessionRepository(db);
  return createSessionInternal(userId, options, sessionRepo);
}

/**
 * Validate a session and return the user if valid (internal implementation with dependency injection)
 */
export async function validateSessionInternal(sessionId: string, sessionRepo: ISessionRepository) {
  const result = await sessionRepo.findByIdWithUser(sessionId);

  if (!result) {
    return { session: null, user: null };
  }

  const { session, user } = result;

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    await sessionRepo.delete(sessionId);
    return { session: null, user: null };
  }

  if (!user || user.isAnonymized) {
    await sessionRepo.delete(sessionId);
    return { session: null, user: null };
  }

  // Check if session should be refreshed (if it's more than halfway to expiration)
  const sessionAge = Date.now() - session.createdAt.getTime();
  const sessionMaxAge = session.expiresAt.getTime() - session.createdAt.getTime();
  const fresh = sessionAge < sessionMaxAge / 2;

  return {
    session: {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      fresh,
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      languagePref: user.languagePref,
      companyId: user.companyId,
    },
  };
}

/**
 * Validate a session and return the user if valid (backward compatible wrapper)
 */
export async function validateSession(sessionId: string) {
  const sessionRepo = new DrizzleSessionRepository(db);
  return validateSessionInternal(sessionId, sessionRepo);
}

/**
 * Refresh a session (extend expiration) (internal implementation with dependency injection)
 */
export async function refreshSessionInternal(
  sessionId: string,
  options: { isTalent?: boolean } | undefined,
  sessionRepo: ISessionRepository
) {
  const timeout = options?.isTalent ? SESSION_TIMEOUT_TALENT : SESSION_TIMEOUT_MANAGER;
  const expiresAt = new Date(Date.now() + timeout);

  await sessionRepo.updateExpiration(sessionId, expiresAt);

  return { id: sessionId, expiresAt };
}

/**
 * Refresh a session (extend expiration) (backward compatible wrapper)
 */
export async function refreshSession(sessionId: string, options?: { isTalent?: boolean }) {
  const sessionRepo = new DrizzleSessionRepository(db);
  return refreshSessionInternal(sessionId, options, sessionRepo);
}

/**
 * Invalidate (delete) a session (internal implementation with dependency injection)
 */
export async function invalidateSessionInternal(
  sessionId: string,
  sessionRepo: ISessionRepository
) {
  await sessionRepo.delete(sessionId);
}

/**
 * Invalidate (delete) a session (backward compatible wrapper)
 */
export async function invalidateSession(sessionId: string) {
  const sessionRepo = new DrizzleSessionRepository(db);
  return invalidateSessionInternal(sessionId, sessionRepo);
}

/**
 * Invalidate all sessions for a user (internal implementation with dependency injection)
 */
export async function invalidateUserSessionsInternal(
  userId: string,
  sessionRepo: ISessionRepository
) {
  await sessionRepo.deleteByUserId(userId);
}

/**
 * Invalidate all sessions for a user (backward compatible wrapper)
 */
export async function invalidateUserSessions(userId: string) {
  const sessionRepo = new DrizzleSessionRepository(db);
  return invalidateUserSessionsInternal(userId, sessionRepo);
}

/**
 * Clean up expired sessions (should be run periodically) (internal implementation with dependency injection)
 */
export async function cleanupExpiredSessionsInternal(sessionRepo: ISessionRepository) {
  return await sessionRepo.deleteExpired();
}

/**
 * Clean up expired sessions (should be run periodically) (backward compatible wrapper)
 */
export async function cleanupExpiredSessions() {
  const sessionRepo = new DrizzleSessionRepository(db);
  return cleanupExpiredSessionsInternal(sessionRepo);
}

/**
 * Create session cookie value
 */
export function createSessionCookie(sessionId: string, expiresAt: Date) {
  const isSecure = process.env.NODE_ENV === 'production';
  const cookieValue = `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax${isSecure ? '; Secure' : ''}; Expires=${expiresAt.toUTCString()}`;
  return cookieValue;
}

/**
 * Create blank session cookie (for logout)
 */
export function createBlankSessionCookie() {
  const isSecure = process.env.NODE_ENV === 'production';
  const cookieValue = `session=; Path=/; HttpOnly; SameSite=Lax${isSecure ? '; Secure' : ''}; Max-Age=0`;
  return cookieValue;
}
