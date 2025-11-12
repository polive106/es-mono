/**
 * Get Current User Use Case
 *
 * Business logic for retrieving the currently authenticated user.
 */

import type { IAuthService } from '../../services/auth.service';
import type { User } from '../../types/auth.types';

export class GetCurrentUserUseCase {
  constructor(private readonly authService: IAuthService) {}

  /**
   * Execute get current user
   *
   * @returns Current authenticated user
   * @throws Error if user is not authenticated or request fails
   */
  async execute(): Promise<User> {
    return await this.authService.getCurrentUser();
  }
}
