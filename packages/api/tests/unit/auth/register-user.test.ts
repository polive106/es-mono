import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerUserInternal, AuthError } from '../../../src/auth/service';
import type { AuthServiceDependencies } from '../../../src/auth/service';
import { createMockRepositories } from '../helpers/mock-repositories';
import * as password from '../../../src/utils/password';
import * as hibp from '../../../src/utils/hibp';

// Mock the password utility
vi.mock('../../../src/utils/password', async () => {
  const actual = await vi.importActual<typeof import('../../../src/utils/password')>('../../../src/utils/password');
  return {
    ...actual,
    hashPassword: vi.fn().mockResolvedValue('hashed_password_123'),
  };
});

// Mock HIBP check to avoid external API calls
vi.mock('../../../src/utils/hibp', async () => {
  const actual = await vi.importActual<typeof import('../../../src/utils/hibp')>('../../../src/utils/hibp');
  return {
    ...actual,
    checkPasswordBreach: vi.fn().mockResolvedValue(0), // Not breached by default
  };
});

describe('registerUserInternal (Unit Tests)', () => {
  let deps: AuthServiceDependencies;

  beforeEach(() => {
    deps = createMockRepositories();
    vi.clearAllMocks();
  });

  describe('Email Validation', () => {
    it('should reject invalid email format', async () => {
      const invalidEmail = 'not-an-email';

      await expect(
        registerUserInternal(
          {
            email: invalidEmail,
            password: 'SecurePassword123!',
            name: 'Test User',
            inviteCode: 'TEST1234',
          },
          deps
        )
      ).rejects.toThrow(AuthError);

      await expect(
        registerUserInternal(
          {
            email: invalidEmail,
            password: 'SecurePassword123!',
            name: 'Test User',
            inviteCode: 'TEST1234',
          },
          deps
        )
      ).rejects.toThrow('Invalid email format');
    });

    it('should accept valid email format', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);
      deps.companyRepo.findByInviteCode.mockResolvedValue({
        id: 'company-1',
        name: 'Test Company',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'TEST1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      deps.userRepo.create.mockResolvedValue({
        id: 'user-1',
        email: 'valid@example.com',
        passwordHash: 'hashed',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await registerUserInternal(
        {
          email: 'valid@example.com',
          password: 'SecurePassword123!',
          name: 'Test User',
          inviteCode: 'TEST1234',
        },
        deps
      );

      expect(deps.userRepo.findByEmail).toHaveBeenCalledWith('valid@example.com');
    });

    it('should normalize email to lowercase', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);
      deps.companyRepo.findByInviteCode.mockResolvedValue({
        id: 'company-1',
        name: 'Test Company',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'TEST1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      deps.userRepo.create.mockResolvedValue({
        id: 'user-1',
        email: 'uppercase@example.com',
        passwordHash: 'hashed',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await registerUserInternal(
        {
          email: 'UPPERCASE@EXAMPLE.COM',
          password: 'SecurePassword123!',
          name: 'Test User',
          inviteCode: 'TEST1234',
        },
        deps
      );

      expect(deps.userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'uppercase@example.com',
        })
      );
    });
  });

  describe('Duplicate Email Check', () => {
    it('should reject duplicate email', async () => {
      deps.userRepo.findByEmail.mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com',
        passwordHash: 'hash',
        name: 'Existing User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        registerUserInternal(
          {
            email: 'existing@example.com',
            password: 'SecurePassword123!',
            name: 'Test User',
            inviteCode: 'TEST1234',
          },
          deps
        )
      ).rejects.toThrow('Email already registered');

      expect(deps.userRepo.findByEmail).toHaveBeenCalledWith('existing@example.com');
      expect(deps.companyRepo.findByInviteCode).not.toHaveBeenCalled();
    });

    it('should proceed when email is not duplicate', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);
      deps.companyRepo.findByInviteCode.mockResolvedValue({
        id: 'company-1',
        name: 'Test Company',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'TEST1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      deps.userRepo.create.mockResolvedValue({
        id: 'user-1',
        email: 'new@example.com',
        passwordHash: 'hashed',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await registerUserInternal(
        {
          email: 'new@example.com',
          password: 'SecurePassword123!',
          name: 'Test User',
          inviteCode: 'TEST1234',
        },
        deps
      );

      expect(deps.userRepo.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(deps.companyRepo.findByInviteCode).toHaveBeenCalled();
    });
  });

  describe('Invite Code Validation', () => {
    it('should reject invalid invite code', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);
      deps.companyRepo.findByInviteCode.mockResolvedValue(null);

      await expect(
        registerUserInternal(
          {
            email: 'test@example.com',
            password: 'SecurePassword123!',
            name: 'Test User',
            inviteCode: 'INVALID',
          },
          deps
        )
      ).rejects.toThrow('Invalid invite code');

      expect(deps.companyRepo.findByInviteCode).toHaveBeenCalledWith('INVALID');
    });

    it('should accept valid invite code', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);
      deps.companyRepo.findByInviteCode.mockResolvedValue({
        id: 'company-1',
        name: 'Test Company',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'VALID123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      deps.userRepo.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await registerUserInternal(
        {
          email: 'test@example.com',
          password: 'SecurePassword123!',
          name: 'Test User',
          inviteCode: 'VALID123',
        },
        deps
      );

      expect(result.companyId).toBe('company-1');
    });
  });

  describe('Password Strength Validation', () => {
    it('should reject password shorter than 12 characters', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);
      deps.companyRepo.findByInviteCode.mockResolvedValue({
        id: 'company-1',
        name: 'Test Company',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'TEST1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        registerUserInternal(
          {
            email: 'test@example.com',
            password: 'Short123',
            name: 'Test User',
            inviteCode: 'TEST1234',
          },
          deps
        )
      ).rejects.toThrow('at least 12 characters');
    });

    it('should accept password with 12 or more characters', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);
      deps.companyRepo.findByInviteCode.mockResolvedValue({
        id: 'company-1',
        name: 'Test Company',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'TEST1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      deps.userRepo.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await registerUserInternal(
        {
          email: 'test@example.com',
          password: 'ValidPassword123',
          name: 'Test User',
          inviteCode: 'TEST1234',
        },
        deps
      );

      expect(deps.userRepo.create).toHaveBeenCalled();
    });
  });

  describe('Password Breach Check', () => {
    it('should reject breached password', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);
      deps.companyRepo.findByInviteCode.mockResolvedValue({
        id: 'company-1',
        name: 'Test Company',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'TEST1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(hibp.checkPasswordBreach).mockResolvedValueOnce(100);

      await expect(
        registerUserInternal(
          {
            email: 'test@example.com',
            password: 'BreachedPassword123',
            name: 'Test User',
            inviteCode: 'TEST1234',
          },
          deps
        )
      ).rejects.toThrow('found in data breaches');
    });

    it('should accept non-breached password', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);
      deps.companyRepo.findByInviteCode.mockResolvedValue({
        id: 'company-1',
        name: 'Test Company',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'TEST1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      deps.userRepo.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(hibp.checkPasswordBreach).mockResolvedValueOnce(0);

      await registerUserInternal(
        {
          email: 'test@example.com',
          password: 'SafePassword123!',
          name: 'Test User',
          inviteCode: 'TEST1234',
        },
        deps
      );

      expect(hibp.checkPasswordBreach).toHaveBeenCalledWith('SafePassword123!');
    });
  });

  describe('Successful Registration', () => {
    it('should create user with correct data', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);
      deps.companyRepo.findByInviteCode.mockResolvedValue({
        id: 'company-1',
        name: 'Test Company',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'TEST1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      deps.userRepo.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed_password_123',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await registerUserInternal(
        {
          email: 'test@example.com',
          password: 'SecurePassword123!',
          name: 'Test User',
          languagePref: 'en',
          inviteCode: 'TEST1234',
        },
        deps
      );

      expect(deps.userRepo.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashed_password_123',
        name: 'Test User',
        languagePref: 'en',
        companyId: 'company-1',
      });

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        companyId: 'company-1',
      });
    });

    it('should default languagePref to "en" when not provided', async () => {
      deps.userRepo.findByEmail.mockResolvedValue(null);
      deps.companyRepo.findByInviteCode.mockResolvedValue({
        id: 'company-1',
        name: 'Test Company',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'TEST1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      deps.userRepo.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        name: 'Test User',
        companyId: 'company-1',
        languagePref: 'en',
        isAnonymized: false,
        lastActivityAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await registerUserInternal(
        {
          email: 'test@example.com',
          password: 'SecurePassword123!',
          name: 'Test User',
          inviteCode: 'TEST1234',
        },
        deps
      );

      expect(deps.userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          languagePref: 'en',
        })
      );
    });
  });
});
