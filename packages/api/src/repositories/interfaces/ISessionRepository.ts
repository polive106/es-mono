import type { Session, NewSession, User } from '@es-mono/database/schema';

/**
 * Session Repository Interface
 *
 * Defines the contract for session data access operations.
 * Implementations should handle all database-specific logic.
 */
export interface ISessionRepository {
  /**
   * Create a new session
   */
  create(sessionData: NewSession): Promise<void>;

  /**
   * Find a session by ID
   */
  findById(sessionId: string): Promise<Session | null>;

  /**
   * Find a session by ID with the associated user
   */
  findByIdWithUser(sessionId: string): Promise<{ session: Session; user: User } | null>;

  /**
   * Update session expiration time
   */
  updateExpiration(sessionId: string, expiresAt: Date): Promise<void>;

  /**
   * Delete a session by ID
   */
  delete(sessionId: string): Promise<void>;

  /**
   * Delete all sessions for a specific user
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Delete all expired sessions
   * @returns Number of sessions deleted
   */
  deleteExpired(): Promise<number>;
}
