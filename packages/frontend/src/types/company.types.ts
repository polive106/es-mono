/**
 * Company Types
 *
 * Type definitions for company-related entities
 */

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501+';

export type CompanyLocation = 'FR' | 'UK' | 'DE' | 'ES' | 'IT' | 'NL' | 'BE' | 'Other';

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: CompanySize;
  location: CompanyLocation;
  inviteCode: string;
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorResponse {
  error?: string;
  message?: string;
}
