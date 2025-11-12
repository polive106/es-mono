/**
 * ValidateInviteCode Use Case
 *
 * Validates if an invite code exists and is usable for registration.
 * Part of Phase 3: User Story 1 - Company Onboarding
 */

import type { CompanyRepository } from '../../ports/repositories/CompanyRepository';

export class ValidateInviteCode {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(inviteCode: string): Promise<boolean> {
    if (!inviteCode || inviteCode.trim().length === 0) {
      return false;
    }

    // Validate invite code format (must be 8 characters)
    if (inviteCode.length !== 8) {
      return false;
    }

    // Check if invite code exists in the database
    const isValid = await this.companyRepository.isInviteCodeValid(inviteCode);

    return isValid;
  }
}
