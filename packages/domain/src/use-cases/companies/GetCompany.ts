/**
 * GetCompany Use Case
 *
 * Retrieves a company by its ID.
 * Part of Phase 3: User Story 1 - Company Onboarding
 */

import type { Company } from '../../entities/Company';
import type { CompanyRepository } from '../../ports/repositories/CompanyRepository';

export class GetCompany {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(companyId: string): Promise<Company> {
    if (!companyId || companyId.trim().length === 0) {
      throw new Error('Company ID is required');
    }

    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new Error(`Company with ID ${companyId} not found`);
    }

    return company;
  }
}
