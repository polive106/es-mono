import { db } from '@es-mono/database';
import { hashPassword, verifyPassword } from '../utils/password';
import { checkPasswordBreach } from '../utils/hibp';
import { invalidateSession, createSessionInternal } from './sessions';
import type {
  IUserRepository,
  ICompanyRepository,
  ISessionRepository,
  IUserRoleRepository,
} from '../repositories/interfaces';
import {
  DrizzleUserRepository,
  DrizzleCompanyRepository,
  DrizzleSessionRepository,
  DrizzleUserRoleRepository,
} from '../repositories/implementations';

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
 * Dependencies for authentication services
 */
export interface AuthServiceDependencies {
  userRepo: IUserRepository;
  companyRepo: ICompanyRepository;
  sessionRepo: ISessionRepository;
  userRoleRepo: IUserRoleRepository;
}

/**
 * Create default repository instances using the database connection
 */
function createDefaultDependencies(): AuthServiceDependencies {
  return {
    userRepo: new DrizzleUserRepository(db),
    companyRepo: new DrizzleCompanyRepository(db),
    sessionRepo: new DrizzleSessionRepository(db),
    userRoleRepo: new DrizzleUserRoleRepository(db),
  };
}

/**
 * Register a new user (internal implementation with dependency injection)
 */
export async function registerUserInternal(
  data: {
    email: string;
    password: string;
    name: string;
    languagePref?: 'en' | 'fr';
    inviteCode: string;
  },
  deps: AuthServiceDependencies
) {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new AuthError('Invalid email format', 'INVALID_EMAIL');
  }

  // Check if email already exists
  const existingUser = await deps.userRepo.findByEmail(data.email);

  if (existingUser) {
    throw new AuthError('Email already registered', 'EMAIL_EXISTS');
  }

  // Validate invite code and get company
  const company = await deps.companyRepo.findByInviteCode(data.inviteCode);

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
  const newUser = await deps.userRepo.create({
    email: data.email.toLowerCase(),
    passwordHash,
    name: data.name,
    languagePref: data.languagePref || 'en',
    companyId: company.id,
  });

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    companyId: newUser.companyId,
  };
}

/**
 * Register a new user (backward compatible wrapper)
 */
export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  languagePref?: 'en' | 'fr';
  inviteCode: string;
}) {
  const deps = createDefaultDependencies();
  return registerUserInternal(data, deps);
}

/**
 * Login user (internal implementation with dependency injection)
 */
export async function loginUserInternal(
  data: { email: string; password: string },
  deps: AuthServiceDependencies
) {
  // Find user by email
  const user = await deps.userRepo.findByIdWithCompany(
    (await deps.userRepo.findByEmail(data.email))?.id || ''
  );

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
  await deps.userRepo.updateLastActivity(user.id, new Date());

  // Check user roles to determine session timeout
  const userRoleRecords = await deps.userRoleRepo.findByUserIdWithRoles(user.id);

  const isTalent = userRoleRecords.some((ur) => ur.role.name === 'talent');

  // Create session
  const session = await createSessionInternal(user.id, { isTalent }, deps.sessionRepo);

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
 * Login user (backward compatible wrapper)
 */
export async function loginUser(data: { email: string; password: string }) {
  const deps = createDefaultDependencies();
  return loginUserInternal(data, deps);
}

/**
 * Logout user
 */
export async function logoutUser(sessionId: string) {
  const sessionCookie = await invalidateSession(sessionId);
  return sessionCookie;
}

/**
 * Change user password (internal implementation with dependency injection)
 */
export async function changePasswordInternal(
  data: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  },
  deps: AuthServiceDependencies
) {
  // Get user
  const user = await deps.userRepo.findById(data.userId);

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
  await deps.userRepo.updatePassword(user.id, passwordHash);

  return { success: true };
}

/**
 * Change user password (backward compatible wrapper)
 */
export async function changePassword(data: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const deps = createDefaultDependencies();
  return changePasswordInternal(data, deps);
}
