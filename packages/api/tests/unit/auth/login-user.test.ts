import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loginUserInternal, AuthError } from '../../../src/auth/service';
import type { AuthServiceDependencies } from '../../../src/auth/service';
import { createMockRepositories } from '../helpers/mock-repositories';
import * as shared from '@es-mono/shared';
import * as sessions from '../../../src/auth/sessions';

// Mock the shared package
vi.mock('@es-mono/shared', async () => {
  const actual = await vi.importActual<typeof import('@es-mono/shared')>('@es-mono/shared');
  return {
    ...actual,
    verifyPassword: vi.fn(),
  };
});

// Mock sessions module
vi.mock('../../../src/auth/sessions', async () => {
  const actual = await vi.importActual('../../../src/auth/sessions');
  return {
    ...actual,
    createSessionInternal: vi.fn(),
  };
});

describe('loginUserInternal (Unit Tests)', () => {
  let deps: AuthServiceDependencies;

  beforeEach(() => {
    deps = createMockRepositories();
    vi.clearAllMocks();
  });

  describe('User Lookup', () => {
    it('should reject login with non-existent email', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);

      await expect(
        loginUserInternal(
          {
            email: 'nonexistent@example.com',
            password: 'password123',
          },
          deps
        )
      ).rejects.toThrow('Invalid credentials');

      expect(deps.userRepo.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should normalize email to lowercase during lookup', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);

      await expect(
        loginUserInternal(
          {
            email: 'UPPERCASE@EXAMPLE.COM',
            password: 'password123',
          },
          deps
        )
      ).rejects.toThrow();

      // Email should be lowercased before lookup
      expect(deps.userRepo.findByEmail).toHaveBeenCalled();
    });
  });

  describe('Anonymized User Check', () => {
    it('should reject login for anonymized user', async () => {
      deps.userRepo.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: true, // Anonymized!
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      deps.userRepo.findByIdWithCompany.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: true,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: {
          id: 'company-1',
          name: 'Test Company',
          industry: 'Technology',
          size: '11-50',
          location: 'FR',
          inviteCode: 'TEST1234',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await expect(
        loginUserInternal(
          {
            email: 'test@example.com',
            password: 'password123',
          },
          deps
        )
      ).rejects.toThrow('Account has been deleted');
    });
  });

  describe('Password Verification', () => {
    it('should reject incorrect password', async () => {
      deps.userRepo.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'correct_hash',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      deps.userRepo.findByIdWithCompany.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'correct_hash',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: {
          id: 'company-1',
          name: 'Test Company',
          industry: 'Technology',
          size: '11-50',
          location: 'FR',
          inviteCode: 'TEST1234',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      vi.mocked(shared.verifyPassword).mockResolvedValue(false);

      await expect(
        loginUserInternal(
          {
            email: 'test@example.com',
            password: 'wrong_password',
          },
          deps
        )
      ).rejects.toThrow('Invalid credentials');

      expect(shared.verifyPassword).toHaveBeenCalledWith('wrong_password', 'correct_hash');
    });

    it('should accept correct password', async () => {
      const now = new Date();

      deps.userRepo.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'correct_hash',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now,
      });

      deps.userRepo.findByIdWithCompany.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'correct_hash',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now,
        company: {
          id: 'company-1',
          name: 'Test Company',
          industry: 'Technology',
          size: '11-50',
          location: 'FR',
          inviteCode: 'TEST1234',
          createdAt: now,
          updatedAt: now,
        },
      });

      deps.userRoleRepo.findByUserIdWithRoles.mockResolvedValue([]);
      deps.userRepo.updateLastActivity.mockResolvedValue();

      vi.mocked(shared.verifyPassword).mockResolvedValue(true);
      vi.mocked(sessions.createSessionInternal).mockResolvedValue({
        id: 'session-123',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        fresh: true,
      });

      await loginUserInternal(
        {
          email: 'test@example.com',
          password: 'correct_password',
        },
        deps
      );

      expect(shared.verifyPassword).toHaveBeenCalledWith('correct_password', 'correct_hash');
    });
  });

  describe('Last Activity Update', () => {
    it('should update user last activity on successful login', async () => {
      const now = new Date();

      deps.userRepo.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now,
      });

      deps.userRepo.findByIdWithCompany.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now,
        company: {
          id: 'company-1',
          name: 'Test Company',
          industry: 'Technology',
          size: '11-50',
          location: 'FR',
          inviteCode: 'TEST1234',
          createdAt: now,
          updatedAt: now,
        },
      });

      deps.userRoleRepo.findByUserIdWithRoles.mockResolvedValue([]);
      deps.userRepo.updateLastActivity.mockResolvedValue();

      vi.mocked(shared.verifyPassword).mockResolvedValue(true);
      vi.mocked(sessions.createSessionInternal).mockResolvedValue({
        id: 'session-123',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        fresh: true,
      });

      await loginUserInternal(
        {
          email: 'test@example.com',
          password: 'correct_password',
        },
        deps
      );

      expect(deps.userRepo.updateLastActivity).toHaveBeenCalledWith(
        'user-1',
        expect.any(Date)
      );
    });
  });

  describe('Session Creation with Role-Based Timeout', () => {
    it('should create session with 24-hour timeout for talent users', async () => {
      const now = new Date();

      deps.userRepo.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'talent@example.com',
        passwordHash: 'hash',
        name: 'Talent User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now,
      });

      deps.userRepo.findByIdWithCompany.mockResolvedValue({
        id: 'user-1',
        email: 'talent@example.com',
        passwordHash: 'hash',
        name: 'Talent User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now,
        company: {
          id: 'company-1',
          name: 'Test Company',
          industry: 'Technology',
          size: '11-50',
          location: 'FR',
          inviteCode: 'TEST1234',
          createdAt: now,
          updatedAt: now,
        },
      });

      deps.userRoleRepo.findByUserIdWithRoles.mockResolvedValue([
        {
          id: 'user-role-1',
          userId: 'user-1',
          roleId: 'role-1',
          createdAt: now,
          role: {
            id: 'role-1',
            name: 'talent',
            description: 'Talent role',
            createdAt: now,
            updatedAt: now,
          },
        },
      ]);

      deps.userRepo.updateLastActivity.mockResolvedValue();

      vi.mocked(shared.verifyPassword).mockResolvedValue(true);
      vi.mocked(sessions.createSessionInternal).mockResolvedValue({
        id: 'session-123',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        fresh: true,
      });

      await loginUserInternal(
        {
          email: 'talent@example.com',
          password: 'password',
        },
        deps
      );

      expect(sessions.createSessionInternal).toHaveBeenCalledWith(
        'user-1',
        { isTalent: true },
        deps.sessionRepo
      );
    });

    it('should create session with 4-hour timeout for manager users', async () => {
      const now = new Date();

      deps.userRepo.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'manager@example.com',
        passwordHash: 'hash',
        name: 'Manager User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now,
      });

      deps.userRepo.findByIdWithCompany.mockResolvedValue({
        id: 'user-1',
        email: 'manager@example.com',
        passwordHash: 'hash',
        name: 'Manager User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now,
        company: {
          id: 'company-1',
          name: 'Test Company',
          industry: 'Technology',
          size: '11-50',
          location: 'FR',
          inviteCode: 'TEST1234',
          createdAt: now,
          updatedAt: now,
        },
      });

      deps.userRoleRepo.findByUserIdWithRoles.mockResolvedValue([
        {
          id: 'user-role-1',
          userId: 'user-1',
          roleId: 'role-1',
          createdAt: now,
          role: {
            id: 'role-1',
            name: 'manager',
            description: 'Manager role',
            createdAt: now,
            updatedAt: now,
          },
        },
      ]);

      deps.userRepo.updateLastActivity.mockResolvedValue();

      vi.mocked(shared.verifyPassword).mockResolvedValue(true);
      vi.mocked(sessions.createSessionInternal).mockResolvedValue({
        id: 'session-123',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        fresh: true,
      });

      await loginUserInternal(
        {
          email: 'manager@example.com',
          password: 'password',
        },
        deps
      );

      expect(sessions.createSessionInternal).toHaveBeenCalledWith(
        'user-1',
        { isTalent: false },
        deps.sessionRepo
      );
    });
  });

  describe('Successful Login Response', () => {
    it('should return user and session data', async () => {
      const now = new Date();

      deps.userRepo.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'fr',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now,
      });

      deps.userRepo.findByIdWithCompany.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hash',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'fr',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: now,
        updatedAt: now,
        company: {
          id: 'company-1',
          name: 'Test Company',
          industry: 'Technology',
          size: '11-50',
          location: 'FR',
          inviteCode: 'TEST1234',
          createdAt: now,
          updatedAt: now,
        },
      });

      deps.userRoleRepo.findByUserIdWithRoles.mockResolvedValue([]);
      deps.userRepo.updateLastActivity.mockResolvedValue();

      vi.mocked(shared.verifyPassword).mockResolvedValue(true);
      vi.mocked(sessions.createSessionInternal).mockResolvedValue({
        id: 'session-123',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        fresh: true,
      });

      const result = await loginUserInternal(
        {
          email: 'test@example.com',
          password: 'password',
        },
        deps
      );

      expect(result).toEqual({
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          languagePref: 'fr',
          companyId: 'company-1',
        },
        session: {
          id: 'session-123',
          userId: 'user-1',
          expiresAt: expect.any(Date),
          fresh: true,
        },
      });
    });
  });
});
