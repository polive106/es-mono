/**
 * CompanyRepository Port
 *
 * Defines the interface for company persistence operations.
 * Implementations must be provided by the infrastructure layer (database package).
 */

import type { Company } from '../../entities/Company';

export interface CompanyRepository {
  /**
   * Find a company by its unique ID
   * @param id - The company ID
   * @returns The company if found, null otherwise
   */
  findById(id: string): Promise<Company | null>;

  /**
   * Find a company by its invite code
   * @param inviteCode - The 8-character invite code
   * @returns The company if found, null otherwise
   */
  findByInviteCode(inviteCode: string): Promise<Company | null>;

  /**
   * Find a company by its name
   * @param name - The company name
   * @returns The company if found, null otherwise
   */
  findByName(name: string): Promise<Company | null>;

  /**
   * Get all companies in the network
   * @returns Array of all companies
   */
  findAll(): Promise<Company[]>;

  /**
   * Create a new company
   * @param company - The company entity to create
   * @returns The created company with generated ID
   */
  create(company: Omit<Company, 'id'>): Promise<Company>;

  /**
   * Update an existing company
   * @param company - The company entity with updates
   * @returns The updated company
   */
  update(company: Company): Promise<Company>;

  /**
   * Delete a company (soft delete - mark as inactive)
   * @param id - The company ID
   * @returns True if deleted successfully
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a company exists by ID
   * @param id - The company ID
   * @returns True if company exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check if an invite code is valid and available
   * @param inviteCode - The invite code to validate
   * @returns True if invite code exists and is valid
   */
  isInviteCodeValid(inviteCode: string): Promise<boolean>;
}
