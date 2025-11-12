import type { Company, NewCompany } from '@es-mono/database/schema';

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

  /**
   * Find a company by name
   */
  findByName(name: string): Promise<Company | null>;

  /**
   * Get all companies in the network
   */
  findAll(): Promise<Company[]>;

  /**
   * Create a new company
   */
  create(companyData: NewCompany): Promise<Company>;

  /**
   * Update an existing company
   */
  update(id: string, updates: Partial<NewCompany>): Promise<Company>;

  /**
   * Check if a company exists by ID
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check if an invite code is valid and available
   */
  isInviteCodeValid(inviteCode: string): Promise<boolean>;
}
