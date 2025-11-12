/**
 * Register Use Case
 *
 * Business logic for user registration.
 * Validates registration data and creates new user through auth service.
 */

import { registerSchema } from '@es-mono/shared';
import type { IAuthService } from '../../services/auth.service';
import type { RegisterData, User } from '../../types/auth.types';

export class RegisterUseCase {
  constructor(private readonly authService: IAuthService) {}

  /**
   * Execute registration
   *
   * @param data - User registration data
   * @returns Newly created user
   * @throws Error if validation fails or registration fails
   */
  async execute(data: RegisterData): Promise<User> {
    // Validate input
    const validatedData = registerSchema.parse(data);

    // Execute registration through service
    const user = await this.authService.register(validatedData);

    return user;
  }
}
