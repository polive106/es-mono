import { db } from '@es-mono/database';
import { users, companies, userRoles } from '@es-mono/database/schema';
import { hashPassword, verifyPassword, checkPasswordBreach } from '@es-mono/shared';
import { eq } from 'drizzle-orm';
import { createSession, invalidateSession } from './sessions';

/**
 * Error types for authentication
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Register a new user
 */
export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  languagePref?: 'en' | 'fr';
  inviteCode: string;
}) {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new AuthError('Invalid email format', 'INVALID_EMAIL');
  }

  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email.toLowerCase()),
  });

  if (existingUser) {
    throw new AuthError('Email already registered', 'EMAIL_EXISTS');
  }

  // Validate invite code and get company
  const company = await db.query.companies.findFirst({
    where: eq(companies.inviteCode, data.inviteCode),
  });

  if (!company) {
    throw new AuthError('Invalid invite code', 'INVALID_INVITE_CODE');
  }

  // Check password strength
  if (data.password.length < 12) {
    throw new AuthError('Password must be at least 12 characters', 'WEAK_PASSWORD');
  }

  // Check if password has been breached
  const breachCount = await checkPasswordBreach(data.password);
  if (breachCount > 0) {
    throw new AuthError(
      'This password has been found in data breaches. Please choose a different password.',
      'BREACHED_PASSWORD'
    );
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      languagePref: data.languagePref || 'en',
      companyId: company.id,
    })
    .returning();

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    companyId: newUser.companyId,
  };
}

/**
 * Login user
 */
export async function loginUser(data: { email: string; password: string }) {
  // Find user by email
  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email.toLowerCase()),
    with: {
      company: true,
    },
  });

  if (!user) {
    throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  // Check if user is anonymized
  if (user.isAnonymized) {
    throw new AuthError('Account has been deleted', 'ACCOUNT_DELETED');
  }

  // Verify password
  const validPassword = await verifyPassword(data.password, user.passwordHash);

  if (!validPassword) {
    throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  // Update last activity
  await db
    .update(users)
    .set({ lastActivityAt: new Date() })
    .where(eq(users.id, user.id));

  // Check user roles to determine session timeout
  const userRoleRecords = await db.query.userRoles.findMany({
    where: eq(userRoles.userId, user.id),
    with: {
      role: true,
    },
  });

  const isTalent = userRoleRecords.some((ur) => ur.role.name === 'talent');

  // Create session
  const session = await createSession(user.id, { isTalent });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      languagePref: user.languagePref,
      companyId: user.companyId,
    },
    session,
  };
}

/**
 * Logout user
 */
export async function logoutUser(sessionId: string) {
  const sessionCookie = await invalidateSession(sessionId);
  return sessionCookie;
}

/**
 * Change user password
 */
export async function changePassword(data: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  // Get user
  const user = await db.query.users.findFirst({
    where: eq(users.id, data.userId),
  });

  if (!user) {
    throw new AuthError('User not found', 'USER_NOT_FOUND');
  }

  // Verify current password
  const validPassword = await verifyPassword(data.currentPassword, user.passwordHash);

  if (!validPassword) {
    throw new AuthError('Current password is incorrect', 'INVALID_PASSWORD');
  }

  // Check new password strength
  if (data.newPassword.length < 12) {
    throw new AuthError('Password must be at least 12 characters', 'WEAK_PASSWORD');
  }

  // Check if new password has been breached
  const breachCount = await checkPasswordBreach(data.newPassword);
  if (breachCount > 0) {
    throw new AuthError(
      'This password has been found in data breaches. Please choose a different password.',
      'BREACHED_PASSWORD'
    );
  }

  // Hash new password
  const passwordHash = await hashPassword(data.newPassword);

  // Update password
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));

  return { success: true };
}
