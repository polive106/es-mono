import { db } from '@es-mono/database';
import { sessions, users } from '@es-mono/database/schema';
import { eq, lt } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const SESSION_TIMEOUT_TALENT = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_TIMEOUT_MANAGER = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Create a new session for a user
 */
export async function createSession(userId: string, options?: { isTalent?: boolean }) {
  const sessionId = randomUUID();
  const timeout = options?.isTalent ? SESSION_TIMEOUT_TALENT : SESSION_TIMEOUT_MANAGER;
  const expiresAt = new Date(Date.now() + timeout);

  await db.insert(sessions).values({
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
 * Validate a session and return the user if valid
 */
export async function validateSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session) {
    return { session: null, user: null };
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return { session: null, user: null };
  }

  // Get user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user || user.isAnonymized) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
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
 * Refresh a session (extend expiration)
 */
export async function refreshSession(sessionId: string, options?: { isTalent?: boolean }) {
  const timeout = options?.isTalent ? SESSION_TIMEOUT_TALENT : SESSION_TIMEOUT_MANAGER;
  const expiresAt = new Date(Date.now() + timeout);

  await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, sessionId));

  return { id: sessionId, expiresAt };
}

/**
 * Invalidate (delete) a session
 */
export async function invalidateSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateUserSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/**
 * Clean up expired sessions (should be run periodically)
 */
export async function cleanupExpiredSessions() {
  const now = new Date();
  const result = await db.delete(sessions).where(lt(sessions.expiresAt, now));
  return result;
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
