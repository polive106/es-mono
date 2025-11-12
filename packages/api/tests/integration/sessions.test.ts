import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  createSession,
  validateSession,
  refreshSession,
  invalidateSession,
  createSessionCookie,
  createBlankSessionCookie,
} from '../../src/auth/sessions';
import { users, companies } from '@es-mono/database/schema';
import { randomUUID } from 'crypto';
import { createTestDatabase } from './setup/test-db';
import type { DB } from '@es-mono/database';

let testDbInstance: DB;

// Mock the database module to use test database
vi.mock('@es-mono/database', async () => {
  const actual = await vi.importActual<typeof import('@es-mono/database')>('@es-mono/database');
  return {
    ...actual,
    get db() {
      return testDbInstance;
    },
  };
});

describe('Session Management Integration Tests', () => {
  let testDb: DB;
  let cleanup: () => Promise<void>;
  let testUserId: string;

  beforeAll(async () => {
    // Create temporary test database
    const result = await createTestDatabase();
    testDb = result.db;
    testDbInstance = result.db; // Set the mock instance
    cleanup = result.cleanup;

    // Create test company with unique invite code and name
    const timestamp = Date.now();
    const [company] = await testDb
      .insert(companies)
      .values({
        name: `Session Test Company ${timestamp}`,
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: `SESS${timestamp.toString().slice(-4)}`,
      })
      .returning();

    // Create test user with unique email
    const [user] = await testDb
      .insert(users)
      .values({
        email: `test-session-${timestamp}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Test User',
        companyId: company.id,
      })
      .returning();
    testUserId = user.id;
  });

  afterAll(async () => {
    await cleanup();
  });

  describe('createSession', () => {
    it('should create a session for talent user with 24 hour timeout', async () => {
      const session = await createSession(testUserId, { isTalent: true });

      expect(session.id).toBeDefined();
      expect(session.userId).toBe(testUserId);
      expect(session.fresh).toBe(true);

      const expirationDuration = session.expiresAt.getTime() - Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      expect(expirationDuration).toBeGreaterThan(twentyFourHours - 1000);
      expect(expirationDuration).toBeLessThan(twentyFourHours + 1000);
    });

    it('should create a session for manager user with 4 hour timeout', async () => {
      const session = await createSession(testUserId, { isTalent: false });

      expect(session.id).toBeDefined();
      const expirationDuration = session.expiresAt.getTime() - Date.now();
      const fourHours = 4 * 60 * 60 * 1000;
      expect(expirationDuration).toBeGreaterThan(fourHours - 1000);
      expect(expirationDuration).toBeLessThan(fourHours + 1000);
    });
  });

  describe('validateSession', () => {
    it('should validate a valid session', async () => {
      const session = await createSession(testUserId);
      const result = await validateSession(session.id);

      expect(result.session).toBeDefined();
      expect(result.session?.userId).toBe(testUserId);
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe(testUserId);
    });

    it('should return null for non-existent session', async () => {
      const fakeSessionId = randomUUID();
      const result = await validateSession(fakeSessionId);

      expect(result.session).toBeNull();
      expect(result.user).toBeNull();
    });
  });

  describe('invalidateSession', () => {
    it('should delete a session', async () => {
      const session = await createSession(testUserId);
      await invalidateSession(session.id);

      const result = await validateSession(session.id);
      expect(result.session).toBeNull();
    });
  });

  describe('createSessionCookie', () => {
    it('should create secure cookie in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const sessionId = randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const cookie = createSessionCookie(sessionId, expiresAt);

      expect(cookie).toContain('session=');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Secure');

      process.env.NODE_ENV = originalEnv;
    });

    it('should create non-secure cookie in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const sessionId = randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const cookie = createSessionCookie(sessionId, expiresAt);

      expect(cookie).toContain('session=');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).not.toContain('Secure');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('createBlankSessionCookie', () => {
    it('should create cookie that clears session', () => {
      const cookie = createBlankSessionCookie();

      expect(cookie).toContain('session=');
      expect(cookie).toContain('Max-Age=0');
      expect(cookie).toContain('HttpOnly');
    });
  });
});
