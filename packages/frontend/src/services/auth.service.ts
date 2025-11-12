/**
 * Auth Service
 *
 * Handles all authentication-related API communications.
 * This is a pure service layer with no React dependencies,
 * making it easy to test and reuse.
 */

import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ErrorResponse,
} from '../types/auth.types';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<User>;
  register(data: RegisterData): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
}

export class AuthService implements IAuthService {
  constructor(private readonly apiUrl: string) {}

  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || error.error || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    return data.user;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${this.apiUrl}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || error.error || 'Registration failed');
    }

    const result: AuthResponse = await response.json();
    return result.user;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const response = await fetch(`${this.apiUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || error.error || 'Logout failed');
    }
  }

  /**
   * Get currently authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.apiUrl}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || error.error || 'Failed to get current user');
    }

    const data: AuthResponse = await response.json();
    return data.user;
  }
}
