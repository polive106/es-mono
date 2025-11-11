import type { DB } from '@es-mono/database';
import { sessions, users } from '@es-mono/database/schema';
import type { Session, NewSession, User } from '@es-mono/database/schema';
import { eq, lt } from 'drizzle-orm';
import type { ISessionRepository } from '../interfaces/ISessionRepository';

/**
 * Drizzle implementation of ISessionRepository
 *
 * Handles all session-related database operations using Drizzle ORM.
 */
export class DrizzleSessionRepository implements ISessionRepository {
  constructor(private readonly db: DB) {}

  async create(sessionData: NewSession): Promise<void> {
    await this.db.insert(sessions).values(sessionData);
  }

  async findById(sessionId: string): Promise<Session | null> {
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);
    return session || null;
  }

  async findByIdWithUser(sessionId: string): Promise<{ session: Session; user: User } | null> {
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session) {
      return null;
    }

    const [user] = await this.db.select().from(users).where(eq(users.id, session.userId)).limit(1);

    if (!user) {
      return null;
    }

    return { session, user };
  }

  async updateExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    await this.db.update(sessions).set({ expiresAt }).where(eq(sessions.id, sessionId));
  }

  async delete(sessionId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    const result = await this.db.delete(sessions).where(lt(sessions.expiresAt, now));
    return result.changes || 0;
  }
}
