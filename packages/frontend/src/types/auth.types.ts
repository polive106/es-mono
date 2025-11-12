/**
 * Authentication-related types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'talent' | 'talent_manager';
  languagePref?: 'en' | 'fr';
  companyId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
  languagePref?: 'en' | 'fr';
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  issues?: Array<{ path: string[]; message: string }>;
}
