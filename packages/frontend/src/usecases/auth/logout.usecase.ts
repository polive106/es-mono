/**
 * Logout Use Case
 *
 * Business logic for user logout.
 * Handles user session termination through auth service.
 */

import type { IAuthService } from '../../services/auth.service';

export class LogoutUseCase {
  constructor(private readonly authService: IAuthService) {}

  /**
   * Execute logout
   *
   * @throws Error if logout fails
   */
  async execute(): Promise<void> {
    await this.authService.logout();
  }
}
