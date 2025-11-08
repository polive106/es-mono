import { createMiddleware } from 'hono/factory';
import { getCookie, setCookie } from 'hono/cookie';
import { validateSession, refreshSession, createSessionCookie } from '../auth/sessions';

/**
 * Session and user types for context
 */
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  languagePref: 'en' | 'fr';
  companyId: string;
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
  fresh: boolean;
};

export type AuthContext = {
  session: Session | null;
  user: SessionUser | null;
};

/**
 * Auth middleware that validates session and attaches user to context
 * This version makes auth optional - the request continues even if not authenticated
 */
export const authMiddleware = createMiddleware<{ Variables: AuthContext }>(async (c, next) => {
  const sessionId = getCookie(c, 'session');

  if (!sessionId) {
    c.set('session', null);
    c.set('user', null);
    await next();
    return;
  }

  const { session, user } = await validateSession(sessionId);

  if (!session || !user) {
    // Invalid session - clear cookie
    setCookie(c, 'session', '', {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    });
    c.set('session', null);
    c.set('user', null);
    await next();
    return;
  }

  // Set session and user in context
  c.set('session', session);
  c.set('user', user);

  // If session is not fresh (>50% through its lifetime), refresh it
  if (!session.fresh) {
    // Determine if user is talent based on their roles (simplified - would need to check roles in production)
    const refreshed = await refreshSession(session.id, { isTalent: false });
    const cookieValue = createSessionCookie(refreshed.id, refreshed.expiresAt);

    // Parse and set the cookie properly
    const [nameValue] = cookieValue.split('; ');
    const [, value] = nameValue.split('=');

    setCookie(c, 'session', value, {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      expires: refreshed.expiresAt,
    });
  }

  return next();
});

/**
 * Auth middleware that REQUIRES authentication
 * Returns 401 if user is not authenticated
 */
export const requireAuth = createMiddleware<{ Variables: AuthContext }>(async (c, next) => {
  const sessionId = getCookie(c, 'session');

  if (!sessionId) {
    return c.json({ error: 'Unauthorized', code: 'NO_SESSION' }, 401);
  }

  const { session, user } = await validateSession(sessionId);

  if (!session || !user) {
    // Invalid session - clear cookie
    setCookie(c, 'session', '', {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    });
    return c.json({ error: 'Unauthorized', code: 'INVALID_SESSION' }, 401);
  }

  // Set session and user in context
  c.set('session', session);
  c.set('user', user);

  // Refresh session if needed
  if (!session.fresh) {
    const refreshed = await refreshSession(session.id, { isTalent: false });
    const cookieValue = createSessionCookie(refreshed.id, refreshed.expiresAt);

    const [nameValue2] = cookieValue.split('; ');
    const [, value2] = nameValue2.split('=');

    setCookie(c, 'session', value2, {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      expires: refreshed.expiresAt,
    });
  }

  return next();
});

/**
 * Helper function to get authenticated user from context
 * Throws error if user is not authenticated (use with requireAuth middleware)
 */
export function getAuthUser(c: { get: (key: 'user') => SessionUser | null }): SessionUser {
  const user = c.get('user');
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}

/**
 * Helper function to get session from context
 */
export function getSession(c: { get: (key: 'session') => Session | null }): Session | null {
  return c.get('session');
}
