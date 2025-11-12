import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createSessionInternal,
  validateSessionInternal,
  refreshSessionInternal,
  invalidateSessionInternal,
  cleanupExpiredSessionsInternal,
  createSessionCookie,
  createBlankSessionCookie,
} from '../../../src/auth/sessions';
import { MockSessionRepository } from '../helpers/mock-repositories';

// Mock crypto.randomUUID
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'test-uuid-123'),
}));

describe('Session Management (Unit Tests)', () => {
  let mockSessionRepo: MockSessionRepository;

  beforeEach(() => {
    mockSessionRepo = new MockSessionRepository();
    vi.clearAllMocks();
  });

  describe('createSessionInternal', () => {
    it('should create session with 24-hour timeout for talent users', async () => {
      mockSessionRepo.create.mockResolvedValue();

      const result = await createSessionInternal('user-123', { isTalent: true }, mockSessionRepo);

      expect(result.id).toBe('test-uuid-123');
      expect(result.userId).toBe('user-123');
      expect(result.fresh).toBe(true);

      const expirationDuration = result.expiresAt.getTime() - Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      expect(expirationDuration).toBeGreaterThan(twentyFourHours - 1000);
      expect(expirationDuration).toBeLessThan(twentyFourHours + 1000);

      expect(mockSessionRepo.create).toHaveBeenCalledWith({
        id: 'test-uuid-123',
        userId: 'user-123',
        expiresAt: expect.any(Date),
      });
    });

    it('should create session with 4-hour timeout for manager users', async () => {
      mockSessionRepo.create.mockResolvedValue();

      const result = await createSessionInternal('user-123', { isTalent: false }, mockSessionRepo);

      const expirationDuration = result.expiresAt.getTime() - Date.now();
      const fourHours = 4 * 60 * 60 * 1000;
      expect(expirationDuration).toBeGreaterThan(fourHours - 1000);
      expect(expirationDuration).toBeLessThan(fourHours + 1000);
    });

    it('should default to manager timeout when isTalent not specified', async () => {
      mockSessionRepo.create.mockResolvedValue();

      const result = await createSessionInternal('user-123', undefined, mockSessionRepo);

      const expirationDuration = result.expiresAt.getTime() - Date.now();
      const fourHours = 4 * 60 * 60 * 1000;
      expect(expirationDuration).toBeGreaterThan(fourHours - 1000);
      expect(expirationDuration).toBeLessThan(fourHours + 1000);
    });
  });

  describe('validateSessionInternal', () => {
    it('should return null for non-existent session', async () => {
      mockSessionRepo.findByIdWithUser.mockResolvedValue(null);

      const result = await validateSessionInternal('non-existent', mockSessionRepo);

      expect(result.session).toBeNull();
      expect(result.user).toBeNull();
      expect(mockSessionRepo.findByIdWithUser).toHaveBeenCalledWith('non-existent');
    });

    it('should delete and return null for expired session', async () => {
      const expiredDate = new Date(Date.now() - 1000); // 1 second ago

      mockSessionRepo.findByIdWithUser.mockResolvedValue({
        session: {
          id: 'session-123',
          userId: 'user-123',
          expiresAt: expiredDate,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        user: {
          id: 'user-123',
          email: 'test@example.com',
          passwordHash: 'hash',
          name: 'Test User',
          companyId: 'company-1',
          languagePref: 'en',
          isAnonymized: false,
          lastActivityAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      mockSessionRepo.delete.mockResolvedValue();

      const result = await validateSessionInternal('session-123', mockSessionRepo);

      expect(result.session).toBeNull();
      expect(result.user).toBeNull();
      expect(mockSessionRepo.delete).toHaveBeenCalledWith('session-123');
    });

    it('should delete and return null for anonymized user', async () => {
      mockSessionRepo.findByIdWithUser.mockResolvedValue({
        session: {
          id: 'session-123',
          userId: 'user-123',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          createdAt: new Date(),
        },
        user: {
          id: 'user-123',
          email: 'test@example.com',
          passwordHash: 'hash',
          name: 'Test User',
          companyId: 'company-1',
          languagePref: 'en',
          isAnonymized: true, // Anonymized!
          lastActivityAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      mockSessionRepo.delete.mockResolvedValue();

      const result = await validateSessionInternal('session-123', mockSessionRepo);

      expect(result.session).toBeNull();
      expect(result.user).toBeNull();
      expect(mockSessionRepo.delete).toHaveBeenCalledWith('session-123');
    });

    it('should return session and user for valid session', async () => {
      const createdAt = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now

      mockSessionRepo.findByIdWithUser.mockResolvedValue({
        session: {
          id: 'session-123',
          userId: 'user-123',
          expiresAt,
          createdAt,
        },
        user: {
          id: 'user-123',
          email: 'test@example.com',
          passwordHash: 'hash',
          name: 'Test User',
          companyId: 'company-1',
          languagePref: 'en',
          isAnonymized: false,
          lastActivityAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await validateSessionInternal('session-123', mockSessionRepo);

      expect(result.session).toEqual({
        id: 'session-123',
        userId: 'user-123',
        expiresAt,
        fresh: expect.any(Boolean),
      });

      expect(result.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        languagePref: 'en',
        companyId: 'company-1',
      });
    });

    it('should mark session as fresh when less than halfway to expiration', async () => {
      const createdAt = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
      const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now (total 4 hours)

      mockSessionRepo.findByIdWithUser.mockResolvedValue({
        session: {
          id: 'session-123',
          userId: 'user-123',
          expiresAt,
          createdAt,
        },
        user: {
          id: 'user-123',
          email: 'test@example.com',
          passwordHash: 'hash',
          name: 'Test User',
          companyId: 'company-1',
          languagePref: 'en',
          isAnonymized: false,
          lastActivityAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await validateSessionInternal('session-123', mockSessionRepo);

      expect(result.session?.fresh).toBe(true);
    });

    it('should mark session as not fresh when more than halfway to expiration', async () => {
      const createdAt = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now (total 4 hours)

      mockSessionRepo.findByIdWithUser.mockResolvedValue({
        session: {
          id: 'session-123',
          userId: 'user-123',
          expiresAt,
          createdAt,
        },
        user: {
          id: 'user-123',
          email: 'test@example.com',
          passwordHash: 'hash',
          name: 'Test User',
          companyId: 'company-1',
          languagePref: 'en',
          isAnonymized: false,
          lastActivityAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const result = await validateSessionInternal('session-123', mockSessionRepo);

      expect(result.session?.fresh).toBe(false);
    });
  });

  describe('refreshSessionInternal', () => {
    it('should update session expiration with talent timeout', async () => {
      mockSessionRepo.updateExpiration.mockResolvedValue();

      const result = await refreshSessionInternal(
        'session-123',
        { isTalent: true },
        mockSessionRepo
      );

      expect(result.id).toBe('session-123');

      const expirationDuration = result.expiresAt.getTime() - Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      expect(expirationDuration).toBeGreaterThan(twentyFourHours - 1000);
      expect(expirationDuration).toBeLessThan(twentyFourHours + 1000);

      expect(mockSessionRepo.updateExpiration).toHaveBeenCalledWith(
        'session-123',
        expect.any(Date)
      );
    });

    it('should update session expiration with manager timeout', async () => {
      mockSessionRepo.updateExpiration.mockResolvedValue();

      const result = await refreshSessionInternal(
        'session-123',
        { isTalent: false },
        mockSessionRepo
      );

      const expirationDuration = result.expiresAt.getTime() - Date.now();
      const fourHours = 4 * 60 * 60 * 1000;
      expect(expirationDuration).toBeGreaterThan(fourHours - 1000);
      expect(expirationDuration).toBeLessThan(fourHours + 1000);
    });
  });

  describe('invalidateSessionInternal', () => {
    it('should delete session', async () => {
      mockSessionRepo.delete.mockResolvedValue();

      await invalidateSessionInternal('session-123', mockSessionRepo);

      expect(mockSessionRepo.delete).toHaveBeenCalledWith('session-123');
    });
  });

  describe('cleanupExpiredSessionsInternal', () => {
    it('should return number of deleted sessions', async () => {
      mockSessionRepo.deleteExpired.mockResolvedValue(5);

      const result = await cleanupExpiredSessionsInternal(mockSessionRepo);

      expect(result).toBe(5);
      expect(mockSessionRepo.deleteExpired).toHaveBeenCalled();
    });
  });

  describe('Cookie Functions (Pure Logic)', () => {
    describe('createSessionCookie', () => {
      it('should create secure cookie in production', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const expiresAt = new Date('2025-12-31T23:59:59Z');
        const cookie = createSessionCookie('session-123', expiresAt);

        expect(cookie).toContain('session=session-123');
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('Secure');
        expect(cookie).toContain('SameSite=Lax');
        expect(cookie).toContain('Path=/');

        process.env.NODE_ENV = originalEnv;
      });

      it('should create non-secure cookie in development', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const expiresAt = new Date('2025-12-31T23:59:59Z');
        const cookie = createSessionCookie('session-123', expiresAt);

        expect(cookie).toContain('session=session-123');
        expect(cookie).toContain('HttpOnly');
        expect(cookie).not.toContain('Secure');
        expect(cookie).toContain('SameSite=Lax');

        process.env.NODE_ENV = originalEnv;
      });
    });

    describe('createBlankSessionCookie', () => {
      it('should create cookie that clears session', () => {
        const cookie = createBlankSessionCookie();

        expect(cookie).toContain('session=');
        expect(cookie).toContain('Max-Age=0');
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('SameSite=Lax');
      });
    });
  });
});
