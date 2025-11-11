import type { Company } from '@es-mono/database/schema';

/**
 * Company Repository Interface
 *
 * Defines the contract for company data access operations.
 * Implementations should handle all database-specific logic.
 */
export interface ICompanyRepository {
  /**
   * Find a company by its invite code
   */
  findByInviteCode(inviteCode: string): Promise<Company | null>;

  /**
   * Find a company by ID
   */
  findById(id: string): Promise<Company | null>;
}
