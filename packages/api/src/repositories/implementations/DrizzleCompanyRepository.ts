import type { DB } from '@es-mono/database';
import { companies } from '@es-mono/database/schema';
import type { Company, NewCompany } from '@es-mono/database/schema';
import { eq, asc } from 'drizzle-orm';
import type { ICompanyRepository } from '../interfaces/ICompanyRepository';

/**
 * Drizzle implementation of ICompanyRepository
 *
 * Handles all company-related database operations using Drizzle ORM.
 * Part of Phase 3: User Story 1 - Company Onboarding
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

  async findByName(name: string): Promise<Company | null> {
    const company = await this.db.query.companies.findFirst({
      where: eq(companies.name, name),
    });
    return company || null;
  }

  async findAll(): Promise<Company[]> {
    const allCompanies = await this.db.query.companies.findMany({
      orderBy: [asc(companies.name)],
    });
    return allCompanies;
  }

  async create(companyData: NewCompany): Promise<Company> {
    const [newCompany] = await this.db.insert(companies).values(companyData).returning();
    return newCompany;
  }

  async update(id: string, updates: Partial<NewCompany>): Promise<Company> {
    const [updatedCompany] = await this.db
      .update(companies)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id))
      .returning();

    if (!updatedCompany) {
      throw new Error(`Company with ID ${id} not found`);
    }

    return updatedCompany;
  }

  async exists(id: string): Promise<boolean> {
    const company = await this.findById(id);
    return company !== null;
  }

  async isInviteCodeValid(inviteCode: string): Promise<boolean> {
    const company = await this.findByInviteCode(inviteCode);
    return company !== null;
  }
}
