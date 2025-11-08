// Shared type definitions for the SkillSwap platform

// User & Role Types
export type LanguagePreference = 'en' | 'fr';
export type RoleScope = 'system' | 'company';
export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'approve';

export const LANGUAGES = ['en', 'fr'] as const;
export const ROLE_SCOPES = ['system', 'company'] as const;
export const PERMISSION_ACTIONS = ['view', 'create', 'update', 'delete', 'approve'] as const;

// Company Types
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500';
export type CompanyLocation = 'FR' | 'UK';

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500'] as const;
export const COMPANY_LOCATIONS = ['FR', 'UK'] as const;

// Skill Types
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

// Mission Status Types
export type MissionStatus =
  | 'proposed'
  | 'negotiating'
  | 'awaiting_consent'
  | 'awaiting_manager'
  | 'awaiting_legal'
  | 'approved'
  | 'active'
  | 'completed'
  | 'cancelled';

export const MISSION_STATUSES = [
  'proposed',
  'negotiating',
  'awaiting_consent',
  'awaiting_manager',
  'awaiting_legal',
  'approved',
  'active',
  'completed',
  'cancelled',
] as const;

// Approval Types
export type ApprovalType = 'employee_consent' | 'manager_approval' | 'legal_check';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export const APPROVAL_TYPES = ['employee_consent', 'manager_approval', 'legal_check'] as const;
export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const;

// Skill Need Types
export type SkillNeedStatus = 'open' | 'matched' | 'fulfilled' | 'cancelled';

export const SKILL_NEED_STATUSES = ['open', 'matched', 'fulfilled', 'cancelled'] as const;

// Credit Transaction Types
export type CreditTransactionType = 'mission' | 'purchase' | 'adjustment';

export const CREDIT_TRANSACTION_TYPES = ['mission', 'purchase', 'adjustment'] as const;

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
