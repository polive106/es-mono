/**
 * Company Entity - Domain Model
 *
 * Represents a company in the SkillSwap platform network.
 * Companies join via invite code and participate in skill exchanges.
 */

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500';
export type CompanyLocation = 'FR' | 'UK';

export interface CompanyProps {
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

export class Company {
  private props: CompanyProps;

  constructor(props: CompanyProps) {
    // Validate company data
    this.validateName(props.name);
    this.validateIndustry(props.industry);
    this.validateSize(props.size);
    this.validateLocation(props.location);
    this.validateInviteCode(props.inviteCode);

    this.props = { ...props };
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get industry(): string {
    return this.props.industry;
  }

  get size(): CompanySize {
    return this.props.size;
  }

  get location(): CompanyLocation {
    return this.props.location;
  }

  get inviteCode(): string {
    return this.props.inviteCode;
  }

  get creditBalance(): number {
    return this.props.creditBalance;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business methods
  updateIndustry(industry: string): void {
    this.validateIndustry(industry);
    this.props.industry = industry;
    this.props.updatedAt = new Date();
  }

  updateSize(size: CompanySize): void {
    this.validateSize(size);
    this.props.size = size;
    this.props.updatedAt = new Date();
  }

  hasNegativeBalance(): boolean {
    return this.props.creditBalance < 0;
  }

  // Validation methods
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Company name cannot be empty');
    }
  }

  private validateIndustry(industry: string): void {
    if (!industry || industry.trim().length === 0) {
      throw new Error('Industry cannot be empty');
    }
  }

  private validateSize(size: string): void {
    const validSizes: CompanySize[] = ['1-10', '11-50', '51-200', '201-500'];
    if (!validSizes.includes(size as CompanySize)) {
      throw new Error('Invalid company size. Must be one of: 1-10, 11-50, 51-200, 201-500');
    }
  }

  private validateLocation(location: string): void {
    const validLocations: CompanyLocation[] = ['FR', 'UK'];
    if (!validLocations.includes(location as CompanyLocation)) {
      throw new Error('Location must be FR or UK');
    }
  }

  private validateInviteCode(inviteCode: string): void {
    if (!inviteCode || inviteCode.length !== 8) {
      throw new Error('Invite code must be 8 characters');
    }
  }

  // Convert to plain object for persistence
  toObject(): CompanyProps {
    return { ...this.props };
  }

  // Factory method to create from database record
  static fromDatabase(data: CompanyProps): Company {
    return new Company({
      ...data,
      createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt),
    });
  }
}
