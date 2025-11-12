import type { DB } from '@es-mono/database';
import { userRoles } from '@es-mono/database/schema';
import type { UserRole, Role } from '@es-mono/database/schema';
import { eq } from 'drizzle-orm';
import type { IUserRoleRepository } from '../interfaces/IUserRoleRepository';

/**
 * Drizzle implementation of IUserRoleRepository
 *
 * Handles all user-role relationship database operations using Drizzle ORM.
 */
export class DrizzleUserRoleRepository implements IUserRoleRepository {
  constructor(private readonly db: DB) {}

  async findByUserIdWithRoles(userId: string): Promise<Array<UserRole & { role: Role }>> {
    const userRoleRecords = await this.db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
      with: {
        role: true,
      },
    });
    return userRoleRecords;
  }
}
