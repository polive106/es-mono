/**
 * List Companies Use Case
 *
 * Retrieves all companies in the network
 */

import type { ICompanyService } from '../../services/company.service';
import type { Company } from '../../types/company.types';

export class ListCompaniesUseCase {
  constructor(private readonly companyService: ICompanyService) {}

  async execute(): Promise<Company[]> {
    return await this.companyService.listCompanies();
  }
}
