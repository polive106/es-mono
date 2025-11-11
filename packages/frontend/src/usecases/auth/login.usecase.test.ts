/**
 * Login Use Case Tests
 *
 * Tests for the login use case in isolation with mocked dependencies.
 * Demonstrates how use cases can be tested without React.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from './login.usecase';
import type { IAuthService } from '../../services/auth.service';
import type { User } from '../../types/auth.types';

describe('LoginUseCase', () => {
  let mockAuthService: IAuthService;
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    // Create mock auth service
    mockAuthService = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    };

    // Create use case with mocked dependency
    loginUseCase = new LoginUseCase(mockAuthService);
  });

  describe('execute', () => {
    it('should call authService.login with validated credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePassword123',
      };
      const expectedUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'talent',
      };
      vi.mocked(mockAuthService.login).mockResolvedValue(expectedUser);

      // Act
      const result = await loginUseCase.execute(credentials);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUser);
    });

    it('should throw validation error for invalid email', async () => {
      // Arrange
      const invalidCredentials = {
        email: 'invalid-email',
        password: 'SecurePassword123',
      };

      // Act & Assert
      await expect(loginUseCase.execute(invalidCredentials)).rejects.toThrow();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should propagate authService errors', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword123',
      };
      const authError = new Error('Invalid credentials');
      vi.mocked(mockAuthService.login).mockRejectedValue(authError);

      // Act & Assert
      await expect(loginUseCase.execute(credentials)).rejects.toThrow('Invalid credentials');
      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
    });

    it('should handle network errors', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePassword123',
      };
      const networkError = new Error('Network error');
      vi.mocked(mockAuthService.login).mockRejectedValue(networkError);

      // Act & Assert
      await expect(loginUseCase.execute(credentials)).rejects.toThrow('Network error');
    });
  });
});
