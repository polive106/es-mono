/**
 * Company Service
 *
 * Handles all company-related API communications.
 * This is a pure service layer with no React dependencies.
 */

import type { Company, CompanySize, ErrorResponse } from '../types/company.types';

export interface ICompanyService {
  getCompany(id: string): Promise<Company>;
  listCompanies(): Promise<Company[]>;
  updateCompany(id: string, updates: Partial<Company>): Promise<Company>;
  validateInviteCode(inviteCode: string): Promise<boolean>;
}

export class CompanyService implements ICompanyService {
  constructor(private readonly apiUrl: string) {}

  /**
   * Get company by ID
   */
  async getCompany(id: string): Promise<Company> {
    const response = await fetch(`${this.apiUrl}/companies/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || error.error || 'Failed to get company');
    }

    const data = await response.json();
    return data.company;
  }

  /**
   * List all companies in network
   */
  async listCompanies(): Promise<Company[]> {
    const response = await fetch(`${this.apiUrl}/companies`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || error.error || 'Failed to list companies');
    }

    const data = await response.json();
    return data.companies;
  }

  /**
   * Update company profile
   */
  async updateCompany(
    id: string,
    updates: { industry?: string; size?: CompanySize }
  ): Promise<Company> {
    const response = await fetch(`${this.apiUrl}/companies/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || error.error || 'Failed to update company');
    }

    const data = await response.json();
    return data.company;
  }

  /**
   * Validate invite code
   */
  async validateInviteCode(inviteCode: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/companies/validate/${inviteCode}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.valid === true;
  }
}
