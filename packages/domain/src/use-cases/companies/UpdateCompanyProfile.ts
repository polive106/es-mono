/**
 * UpdateCompanyProfile Use Case
 *
 * Updates a company's profile information (industry, size, etc.).
 * Part of Phase 3: User Story 1 - Company Onboarding
 */

import type { Company, CompanySize } from '../../entities/Company';
import type { CompanyRepository } from '../../ports/repositories/CompanyRepository';

export interface UpdateCompanyProfileInput {
  companyId: string;
  updates: {
    industry?: string;
    size?: CompanySize;
  };
}

export class UpdateCompanyProfile {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(input: UpdateCompanyProfileInput): Promise<Company> {
    const { companyId, updates } = input;

    if (!companyId || companyId.trim().length === 0) {
      throw new Error('Company ID is required');
    }

    // Retrieve the existing company
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new Error(`Company with ID ${companyId} not found`);
    }

    // Apply updates using entity methods (which include validation)
    if (updates.industry !== undefined) {
      if (!updates.industry || updates.industry.trim().length === 0) {
        throw new Error('Invalid industry');
      }
      company.updateIndustry(updates.industry);
    }

    if (updates.size !== undefined) {
      company.updateSize(updates.size);
    }

    // Persist the updated company
    const updatedCompany = await this.companyRepository.update(company);

    return updatedCompany;
  }
}
