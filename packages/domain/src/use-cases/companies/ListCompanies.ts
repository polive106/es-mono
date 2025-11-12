/**
 * ListCompanies Use Case
 *
 * Retrieves all companies in the network.
 * Part of Phase 3: User Story 1 - Company Onboarding
 */

import type { Company } from '../../entities/Company';
import type { CompanyRepository } from '../../ports/repositories/CompanyRepository';

export class ListCompanies {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async execute(): Promise<Company[]> {
    const companies = await this.companyRepository.findAll();
    return companies;
  }
}
