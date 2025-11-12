/**
 * Login Use Case
 *
 * Business logic for user login.
 * Validates credentials and authenticates user through auth service.
 */

import { loginSchema } from '@es-mono/shared';
import type { IAuthService } from '../../services/auth.service';
import type { LoginCredentials, User } from '../../types/auth.types';

export class LoginUseCase {
  constructor(private readonly authService: IAuthService) {}

  /**
   * Execute login
   *
   * @param credentials - User login credentials
   * @returns Authenticated user
   * @throws Error if validation fails or login fails
   */
  async execute(credentials: LoginCredentials): Promise<User> {
    // Validate input
    const validatedData = loginSchema.parse(credentials);

    // Execute login through service
    const user = await this.authService.login(validatedData);

    return user;
  }
}
