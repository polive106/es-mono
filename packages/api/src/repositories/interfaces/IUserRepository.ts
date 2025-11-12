import type { User, NewUser, Company } from '@es-mono/database/schema';

/**
 * User Repository Interface
 *
 * Defines the contract for user data access operations.
 * Implementations should handle all database-specific logic.
 */
export interface IUserRepository {
  /**
   * Find a user by email address (case-insensitive)
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by ID with their associated company
   */
  findByIdWithCompany(id: string): Promise<(User & { company: Company }) | null>;

  /**
   * Create a new user
   */
  create(userData: NewUser): Promise<User>;

  /**
   * Update user's password hash
   */
  updatePassword(userId: string, passwordHash: string): Promise<void>;

  /**
   * Update user's last activity timestamp
   */
  updateLastActivity(userId: string, timestamp: Date): Promise<void>;
}
