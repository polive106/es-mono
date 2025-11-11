import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './password';
import { PASSWORD_MIN_LENGTH } from '../constants';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a valid password', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true); // bcrypt hash format
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'SecurePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // bcrypt uses unique salts
    });

    it('should reject password shorter than minimum length', async () => {
      const shortPassword = 'short';

      await expect(hashPassword(shortPassword)).rejects.toThrow(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
      );
    });

    it('should accept password at minimum length', async () => {
      const minLengthPassword = 'A'.repeat(PASSWORD_MIN_LENGTH);
      const hash = await hashPassword(minLengthPassword);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$2')).toBe(true);
    });

    it('should handle long passwords', async () => {
      const longPassword = 'SecurePassword123!' + 'x'.repeat(100);
      const hash = await hashPassword(longPassword);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$2')).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should reject password with different casing', async () => {
      const password = 'SecurePassword123!';
      const wrongCasingPassword = 'securepassword123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongCasingPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should reject password with extra characters', async () => {
      const password = 'SecurePassword123!';
      const wrongPassword = 'SecurePassword123!x';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should reject empty password', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const password = 'SecurePassword123!';
      const invalidHash = 'invalid-hash';

      // bcrypt returns false for invalid hash formats instead of throwing
      const isValid = await verifyPassword(password, invalidHash);
      expect(isValid).toBe(false);
    });
  });

  describe('password hashing security', () => {
    it('should use sufficient salt rounds (slow enough)', async () => {
      const password = 'SecurePassword123!';
      const startTime = Date.now();

      await hashPassword(password);

      const duration = Date.now() - startTime;

      // bcrypt with 12 rounds should take at least 50ms
      expect(duration).toBeGreaterThan(50);
    });
  });
});
