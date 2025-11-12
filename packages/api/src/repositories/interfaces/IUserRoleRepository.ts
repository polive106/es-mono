import type { UserRole, Role } from '@es-mono/database/schema';

/**
 * UserRole Repository Interface
 *
 * Defines the contract for user-role relationship data access operations.
 * Implementations should handle all database-specific logic.
 */
export interface IUserRoleRepository {
  /**
   * Find all roles for a user with role details
   */
  findByUserIdWithRoles(userId: string): Promise<Array<UserRole & { role: Role }>>;
}
