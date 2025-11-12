/**
 * Update Company Use Case
 *
 * Updates a company's profile information
 */

import type { ICompanyService } from '../../services/company.service';
import type { Company, CompanySize } from '../../types/company.types';

export interface UpdateCompanyInput {
  companyId: string;
  updates: {
    industry?: string;
    size?: CompanySize;
  };
}

export class UpdateCompanyUseCase {
  constructor(private readonly companyService: ICompanyService) {}

  async execute(input: UpdateCompanyInput): Promise<Company> {
    const { companyId, updates } = input;

    if (!companyId || companyId.trim().length === 0) {
      throw new Error('Company ID is required');
    }

    if (!updates.industry && !updates.size) {
      throw new Error('At least one field must be updated');
    }

    return await this.companyService.updateCompany(companyId, updates);
  }
}
