/**
 * Logout Use Case Tests
 *
 * Tests for the logout use case in isolation with mocked dependencies.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogoutUseCase } from './logout.usecase';
import type { IAuthService } from '../../services/auth.service';

describe('LogoutUseCase', () => {
  let mockAuthService: IAuthService;
  let logoutUseCase: LogoutUseCase;

  beforeEach(() => {
    // Create mock auth service
    mockAuthService = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    };

    // Create use case with mocked dependency
    logoutUseCase = new LogoutUseCase(mockAuthService);
  });

  describe('execute', () => {
    it('should call authService.logout', async () => {
      // Arrange
      vi.mocked(mockAuthService.logout).mockResolvedValue();

      // Act
      await logoutUseCase.execute();

      // Assert
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });

    it('should propagate authService errors', async () => {
      // Arrange
      const logoutError = new Error('Logout failed');
      vi.mocked(mockAuthService.logout).mockRejectedValue(logoutError);

      // Act & Assert
      await expect(logoutUseCase.execute()).rejects.toThrow('Logout failed');
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors', async () => {
      // Arrange
      const networkError = new Error('Network error');
      vi.mocked(mockAuthService.logout).mockRejectedValue(networkError);

      // Act & Assert
      await expect(logoutUseCase.execute()).rejects.toThrow('Network error');
    });
  });
});
