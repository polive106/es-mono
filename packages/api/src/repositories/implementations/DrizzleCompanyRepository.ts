import type { DB } from '@es-mono/database';
import { companies } from '@es-mono/database/schema';
import type { Company } from '@es-mono/database/schema';
import { eq } from 'drizzle-orm';
import type { ICompanyRepository } from '../interfaces/ICompanyRepository';

/**
 * Drizzle implementation of ICompanyRepository
 *
 * Handles all company-related database operations using Drizzle ORM.
 */
export class DrizzleCompanyRepository implements ICompanyRepository {
  constructor(private readonly db: DB) {}

  async findByInviteCode(inviteCode: string): Promise<Company | null> {
    const company = await this.db.query.companies.findFirst({
      where: eq(companies.inviteCode, inviteCode),
    });
    return company || null;
  }

  async findById(id: string): Promise<Company | null> {
    const company = await this.db.query.companies.findFirst({
      where: eq(companies.id, id),
    });
    return company || null;
  }
}
