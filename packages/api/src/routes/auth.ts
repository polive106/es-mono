import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { registerUser, loginUser, logoutUser, changePassword } from '../auth/service';
import { requireAuth, getAuthUser } from '../middleware/auth';
import { rateLimitWrite } from '../middleware/rateLimit';
import { createSessionCookie } from '../auth/sessions';
import { setCookie } from 'hono/cookie';

const authRoutes = new Hono();

/**
 * POST /api/auth/register
 * Register a new user
 */
authRoutes.post(
  '/register',
  rateLimitWrite,
  zValidator(
    'json',
    z.object({
      email: z.string().email(),
      password: z.string().min(12),
      name: z.string().min(2),
      languagePref: z.enum(['en', 'fr']).optional(),
      inviteCode: z.string().length(8),
    })
  ),
  async (c) => {
    const data = c.req.valid('json');

    const user = await registerUser(data);

    return c.json(
      {
        message: 'User registered successfully',
        user,
      },
      201
    );
  }
);

/**
 * POST /api/auth/login
 * Login user and create session
 */
authRoutes.post(
  '/login',
  rateLimitWrite,
  zValidator(
    'json',
    z.object({
      email: z.string().email(),
      password: z.string(),
    })
  ),
  async (c) => {
    const data = c.req.valid('json');

    const { user, session } = await loginUser(data);

    // Set session cookie
    const cookieValue = createSessionCookie(session.id, session.expiresAt);
    const [nameValue] = cookieValue.split('; ');
    const [, value] = nameValue.split('=');

    setCookie(c, 'session', value, {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      expires: session.expiresAt,
    });

    return c.json({
      message: 'Login successful',
      user,
    });
  }
);

/**
 * POST /api/auth/logout
 * Logout user and destroy session
 */
authRoutes.post('/logout', requireAuth, async (c) => {
  const session = c.get('session');

  if (session) {
    await logoutUser(session.id);
  }

  // Clear session cookie
  setCookie(c, 'session', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });

  return c.json({ message: 'Logout successful' });
});

/**
 * GET /api/auth/me
 * Get current user info
 */
authRoutes.get('/me', requireAuth, async (c) => {
  const user = getAuthUser(c);

  return c.json({ user });
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
authRoutes.post(
  '/change-password',
  requireAuth,
  rateLimitWrite,
  zValidator(
    'json',
    z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(12),
    })
  ),
  async (c) => {
    const user = getAuthUser(c);
    const data = c.req.valid('json');

    await changePassword({
      userId: user.id,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    return c.json({ message: 'Password changed successfully' });
  }
);

export default authRoutes;
