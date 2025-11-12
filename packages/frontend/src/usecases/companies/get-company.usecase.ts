/**
 * Get Company Use Case
 *
 * Retrieves a company by ID
 */

import type { ICompanyService } from '../../services/company.service';
import type { Company } from '../../types/company.types';

export class GetCompanyUseCase {
  constructor(private readonly companyService: ICompanyService) {}

  async execute(id: string): Promise<Company> {
    if (!id || id.trim().length === 0) {
      throw new Error('Company ID is required');
    }

    return await this.companyService.getCompany(id);
  }
}
