import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkPasswordBreach, isPasswordSafe } from './hibp';

describe('HIBP Password Breach Checker', () => {
  describe('checkPasswordBreach', () => {
    it('should detect a commonly breached password', async () => {
      // "password" is known to be in HIBP database
      const count = await checkPasswordBreach('password');
      expect(count).toBeGreaterThan(0);
    });

    it('should return 0 for a strong unique password', async () => {
      // Generate a random UUID-based password (very unlikely to be in breaches)
      const uniquePassword = `Str0ng!Pass_${crypto.randomUUID()}`;
      const count = await checkPasswordBreach(uniquePassword);
      expect(count).toBe(0);
    }, 10000); // Increase timeout for API call

    it('should handle API errors gracefully', async () => {
      // Mock fetch to simulate API error
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      await expect(checkPasswordBreach('testpassword')).rejects.toThrow(
        'HIBP API error: 503 Service Unavailable'
      );

      global.fetch = originalFetch;
    });
  });

  describe('isPasswordSafe', () => {
    it('should return false for a breached password', async () => {
      const safe = await isPasswordSafe('password123');
      expect(safe).toBe(false);
    });

    it('should return true for a safe password', async () => {
      const uniquePassword = `Secure!2024_${crypto.randomUUID()}`;
      const safe = await isPasswordSafe(uniquePassword);
      expect(safe).toBe(true);
    }, 10000);

    it('should return true if HIBP API is unavailable (fail open)', async () => {
      // Mock fetch to simulate network error
      const originalFetch = global.fetch;
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const safe = await isPasswordSafe('anypassword');
      expect(safe).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('HIBP check failed'),
        expect.any(Error)
      );

      global.fetch = originalFetch;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('k-anonymity implementation', () => {
    it('should only send first 5 characters of hash to API', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');

      // Password "test" has SHA-1 hash A94A8FE5CCB19BA61C4C0873D391E987982FBBD3
      await checkPasswordBreach('test').catch(() => {});

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringMatching(/range\/[A-F0-9]{5}$/),
        expect.any(Object)
      );

      fetchSpy.mockRestore();
    });
  });
});
