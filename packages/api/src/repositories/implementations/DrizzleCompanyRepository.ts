import type { DB } from '@es-mono/database';
import { companies } from '@es-mono/database/schema';
import type { Company as DBCompany, NewCompany } from '@es-mono/database/schema';
import { eq, asc } from 'drizzle-orm';
import { Company, type CompanyProps, type CompanyRepository } from '@es-mono/domain';

/**
 * Drizzle implementation of CompanyRepository (Domain Port)
 *
 * This adapter converts between database records and domain entities,
 * following hexagonal architecture principles.
 *
 * Part of Phase 3: User Story 1 - Company Onboarding
 */
export class DrizzleCompanyRepository implements CompanyRepository {
  constructor(private readonly db: DB) {}

  /**
   * Convert database record to domain entity
   */
  private toDomain(dbCompany: DBCompany): Company {
    return Company.fromDatabase({
      id: dbCompany.id,
      name: dbCompany.name,
      industry: dbCompany.industry,
      size: dbCompany.size as CompanyProps['size'],
      location: dbCompany.location as CompanyProps['location'],
      inviteCode: dbCompany.inviteCode,
      creditBalance: dbCompany.creditBalance,
      createdAt:
        dbCompany.createdAt instanceof Date ? dbCompany.createdAt : new Date(dbCompany.createdAt),
      updatedAt:
        dbCompany.updatedAt instanceof Date ? dbCompany.updatedAt : new Date(dbCompany.updatedAt),
    });
  }

  async findByInviteCode(inviteCode: string): Promise<Company | null> {
    const company = await this.db.query.companies.findFirst({
      where: eq(companies.inviteCode, inviteCode),
    });
    return company ? this.toDomain(company) : null;
  }

  async findById(id: string): Promise<Company | null> {
    const company = await this.db.query.companies.findFirst({
      where: eq(companies.id, id),
    });
    return company ? this.toDomain(company) : null;
  }

  async findByName(name: string): Promise<Company | null> {
    const company = await this.db.query.companies.findFirst({
      where: eq(companies.name, name),
    });
    return company ? this.toDomain(company) : null;
  }

  async findAll(): Promise<Company[]> {
    const allCompanies = await this.db.query.companies.findMany({
      orderBy: [asc(companies.name)],
    });
    return allCompanies.map((c: DBCompany) => this.toDomain(c));
  }

  async create(companyData: Omit<Company, 'id'>): Promise<Company> {
    // For creation, we need to extract the data from the partial entity
    // This is a bit awkward with the current design, but works
    const data = companyData as unknown as CompanyProps;

    const newCompanyData: NewCompany = {
      name: data.name,
      industry: data.industry,
      size: data.size,
      location: data.location,
      inviteCode: data.inviteCode,
      creditBalance: data.creditBalance ?? 0,
    };

    const [newCompany] = await this.db.insert(companies).values(newCompanyData).returning();
    return this.toDomain(newCompany);
  }

  async update(company: Company): Promise<Company> {
    const companyData = company.toObject();

    const [updatedCompany] = await this.db
      .update(companies)
      .set({
        name: companyData.name,
        industry: companyData.industry,
        size: companyData.size,
        location: companyData.location,
        creditBalance: companyData.creditBalance,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, company.id))
      .returning();

    if (!updatedCompany) {
      throw new Error(`Company with ID ${company.id} not found`);
    }

    return this.toDomain(updatedCompany);
  }

  async delete(id: string): Promise<boolean> {
    // For MVP, we'll do hard delete. In production, this would be soft delete
    const result = await this.db.delete(companies).where(eq(companies.id, id)).returning();
    return result.length > 0;
  }

  async exists(id: string): Promise<boolean> {
    const company = await this.findById(id);
    return company !== null;
  }

  async isInviteCodeValid(inviteCode: string): Promise<boolean> {
    const company = await this.findByInviteCode(inviteCode);
    return company !== null;
  }

  /**
   * Helper method for API layer that needs to work with database types
   * This bridges the gap until API routes are fully refactored
   */
  async updateById(id: string, updates: Partial<NewCompany>): Promise<Company> {
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

    return this.toDomain(updatedCompany);
  }
}
