/**
 * Register Use Case Tests
 *
 * Tests for the register use case in isolation with mocked dependencies.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUseCase } from './register.usecase';
import type { IAuthService } from '../../services/auth.service';
import type { User } from '../../types/auth.types';

describe('RegisterUseCase', () => {
  let mockAuthService: IAuthService;
  let registerUseCase: RegisterUseCase;

  beforeEach(() => {
    // Create mock auth service
    mockAuthService = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    };

    // Create use case with mocked dependency
    registerUseCase = new RegisterUseCase(mockAuthService);
  });

  describe('execute', () => {
    it('should call authService.register with validated data', async () => {
      // Arrange
      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePassword123',
        inviteCode: 'INVITE12',
        languagePref: 'en' as const,
      };
      const expectedUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'talent',
        languagePref: 'en',
      };
      vi.mocked(mockAuthService.register).mockResolvedValue(expectedUser);

      // Act
      const result = await registerUseCase.execute(registerData);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUser);
    });

    it('should throw validation error for short name', async () => {
      // Arrange
      const invalidData = {
        name: 'A',
        email: 'test@example.com',
        password: 'SecurePassword123',
        inviteCode: 'INVITE12',
      };

      // Act & Assert
      await expect(registerUseCase.execute(invalidData)).rejects.toThrow();
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid email', async () => {
      // Arrange
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'SecurePassword123',
        inviteCode: 'INVITE12',
      };

      // Act & Assert
      await expect(registerUseCase.execute(invalidData)).rejects.toThrow();
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should throw validation error for short password', async () => {
      // Arrange
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
        inviteCode: 'INVITE12',
      };

      // Act & Assert
      await expect(registerUseCase.execute(invalidData)).rejects.toThrow();
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should throw validation error for invalid invite code length', async () => {
      // Arrange
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePassword123',
        inviteCode: 'SHORT',
      };

      // Act & Assert
      await expect(registerUseCase.execute(invalidData)).rejects.toThrow();
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should propagate authService errors', async () => {
      // Arrange
      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePassword123',
        inviteCode: 'INVITE12',
      };
      const authError = new Error('Email already exists');
      vi.mocked(mockAuthService.register).mockRejectedValue(authError);

      // Act & Assert
      await expect(registerUseCase.execute(registerData)).rejects.toThrow('Email already exists');
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
    });
  });
});
