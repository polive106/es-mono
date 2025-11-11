import type { DB } from '@es-mono/database';
import { users } from '@es-mono/database/schema';
import type { User, NewUser, Company } from '@es-mono/database/schema';
import { eq } from 'drizzle-orm';
import type { IUserRepository } from '../interfaces/IUserRepository';

/**
 * Drizzle implementation of IUserRepository
 *
 * Handles all user-related database operations using Drizzle ORM.
 */
export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: DB) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user || null;
  }

  async findByIdWithCompany(id: string): Promise<(User & { company: Company }) | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        company: true,
      },
    });
    return user || null;
  }

  async create(userData: NewUser): Promise<User> {
    const [newUser] = await this.db.insert(users).values(userData).returning();
    return newUser;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateLastActivity(userId: string, timestamp: Date): Promise<void> {
    await this.db.update(users).set({ lastActivityAt: timestamp }).where(eq(users.id, userId));
  }
}
