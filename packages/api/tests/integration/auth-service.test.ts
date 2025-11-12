import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { registerUser, loginUser, AuthError } from '../../src/auth/service';
import { companies } from '@es-mono/database/schema';
import * as hibp from '../../src/utils/hibp';
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

// Mock HIBP check to avoid external API calls
vi.mock('../../src/utils/hibp', async () => {
  const actual =
    await vi.importActual<typeof import('../../src/utils/hibp')>('../../src/utils/hibp');
  return {
    ...actual,
    checkPasswordBreach: vi.fn().mockResolvedValue(0), // Not breached by default
  };
});

describe('Auth Service Integration Tests', () => {
  let testDb: DB;
  let cleanup: () => Promise<void>;
  let testCompanyId: string;
  let testInviteCode: string;
  const testPassword = 'SecurePassword123!';

  beforeAll(async () => {
    // Create temporary test database
    const result = await createTestDatabase();
    testDb = result.db;
    testDbInstance = result.db; // Set the mock instance
    cleanup = result.cleanup;

    // Create test company with unique invite code and name
    const timestamp = Date.now();
    testInviteCode = `AUTH${timestamp.toString().slice(-4)}`;
    const [company] = await testDb
      .insert(companies)
      .values({
        name: `Auth Test Company ${timestamp}`,
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: testInviteCode,
      })
      .returning();
    testCompanyId = company.id;
  });

  afterAll(async () => {
    await cleanup();
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        email: `newuser-${Date.now()}@example.com`,
        password: testPassword,
        name: 'New User',
        languagePref: 'en' as const,
        inviteCode: testInviteCode,
      };

      const result = await registerUser(userData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe(userData.email.toLowerCase());
      expect(result.name).toBe(userData.name);
      expect(result.companyId).toBe(testCompanyId);
    });

    it('should normalize email to lowercase', async () => {
      const uniqueEmail = `UPPERCASE-${Date.now()}@EXAMPLE.COM`;
      const userData = {
        email: uniqueEmail,
        password: testPassword,
        name: 'Upper User',
        languagePref: 'en' as const,
        inviteCode: testInviteCode,
      };

      const result = await registerUser(userData);
      expect(result.email).toBe(uniqueEmail.toLowerCase());
    });

    it('should reject invalid email format', async () => {
      const userData = {
        email: 'not-an-email',
        password: testPassword,
        name: 'Bad Email',
        languagePref: 'en' as const,
        inviteCode: testInviteCode,
      };

      await expect(registerUser(userData)).rejects.toThrow(AuthError);
      await expect(registerUser(userData)).rejects.toThrow('Invalid email format');
    });

    it('should reject duplicate email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      await registerUser({
        email,
        password: testPassword,
        name: 'First User',
        languagePref: 'en' as const,
        inviteCode: testInviteCode,
      });

      await expect(
        registerUser({
          email,
          password: testPassword,
          name: 'Second User',
          languagePref: 'en' as const,
          inviteCode: testInviteCode,
        })
      ).rejects.toThrow('Email already registered');
    });

    it('should reject invalid invite code', async () => {
      const userData = {
        email: `test-invalid-${Date.now()}@example.com`,
        password: testPassword,
        name: 'Test User',
        languagePref: 'en' as const,
        inviteCode: 'INVALID1',
      };

      await expect(registerUser(userData)).rejects.toThrow('Invalid invite code');
    });

    it('should reject password shorter than 12 characters', async () => {
      const userData = {
        email: `shortpass-${Date.now()}@example.com`,
        password: 'Short123',
        name: 'Short Pass User',
        languagePref: 'en' as const,
        inviteCode: testInviteCode,
      };

      await expect(registerUser(userData)).rejects.toThrow('at least 12 characters');
    });

    it('should reject breached password', async () => {
      vi.mocked(hibp.checkPasswordBreach).mockResolvedValueOnce(100);

      const userData = {
        email: `breached-${Date.now()}@example.com`,
        password: 'BreachedPassword123',
        name: 'Breached User',
        languagePref: 'en' as const,
        inviteCode: testInviteCode,
      };

      await expect(registerUser(userData)).rejects.toThrow('found in data breaches');
    });
  });

  describe('loginUser', () => {
    const loginEmail = `logintest-${Date.now()}@example.com`;

    beforeAll(async () => {
      await registerUser({
        email: loginEmail,
        password: testPassword,
        name: 'Login Test User',
        inviteCode: testInviteCode,
      });
    });

    it('should successfully login with correct credentials', async () => {
      const result = await loginUser({
        email: loginEmail,
        password: testPassword,
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(loginEmail);
      expect(result.session).toBeDefined();
      expect(result.session.id).toBeDefined();
    });

    it('should normalize email to lowercase during login', async () => {
      const result = await loginUser({
        email: loginEmail.toUpperCase(),
        password: testPassword,
      });

      expect(result.user.email).toBe(loginEmail.toLowerCase());
    });

    it('should reject login with non-existent email', async () => {
      await expect(
        loginUser({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject login with incorrect password', async () => {
      await expect(
        loginUser({
          email: loginEmail,
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
