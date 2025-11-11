import { z } from 'zod';
import {
  LANGUAGES,
  COMPANY_SIZES,
  COMPANY_LOCATIONS,
  PROFICIENCY_LEVELS,
  MISSION_STATUSES,
  APPROVAL_TYPES,
  APPROVAL_STATUSES,
  SKILL_NEED_STATUSES,
  CREDIT_TRANSACTION_TYPES,
} from '../types';

// User Validation Schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255);
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(12, 'Password must be at least 12 characters');
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(100);
export const languageSchema = z.enum(LANGUAGES);

export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  languagePref: languageSchema.default('en'),
  companyId: z.string().uuid(),
  inviteCode: z.string().length(8),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  inviteCode: z
    .string()
    .min(1, 'Invite code is required')
    .length(8, 'Invite code must be exactly 8 characters'),
  languagePref: languageSchema.optional(),
});

// Company Validation Schemas
export const companySizeSchema = z.enum(COMPANY_SIZES);
export const companyLocationSchema = z.enum(COMPANY_LOCATIONS);

export const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  industry: z.string().max(50),
  size: companySizeSchema,
  location: companyLocationSchema,
});

export const updateCompanySchema = createCompanySchema.partial();

// Skill Validation Schemas
export const proficiencyLevelSchema = z.enum(PROFICIENCY_LEVELS);

export const addSkillSchema = z.object({
  skillId: z.string().uuid(),
  proficiencyLevel: proficiencyLevelSchema,
  yearsExperience: z.number().int().min(0).max(50).optional(),
});

export const createSkillSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().max(50),
  description: z.string().optional(),
});

// Availability Validation Schemas
export const setAvailabilitySchema = z.object({
  availabilityPct: z.number().int().min(0).max(100),
  isAvailable: z.boolean(),
  isAnonymized: z.boolean().default(true),
  activeFrom: z.date().optional(),
  activeUntil: z.date().optional(),
});

// Mission Validation Schemas
export const missionStatusSchema = z.enum(MISSION_STATUSES);

export const createMissionSchema = z.object({
  receivingCompanyId: z.string().uuid(),
  talentUserId: z.string().uuid(),
  skillNeedId: z.string().uuid().optional(),
  durationMonths: z.number().int().min(1).max(12),
  timeCommitmentHrsWeek: z.number().int().min(1).max(40),
  creditValue: z.number().int().min(1).max(10000),
});

// Approval Validation Schemas
export const approvalTypeSchema = z.enum(APPROVAL_TYPES);
export const approvalStatusSchema = z.enum(APPROVAL_STATUSES);

export const submitApprovalSchema = z.object({
  status: approvalStatusSchema,
  comments: z.string().max(500).optional(),
});

// Skill Need Validation Schemas
export const skillNeedStatusSchema = z.enum(SKILL_NEED_STATUSES);

export const createSkillNeedSchema = z.object({
  skillId: z.string().uuid(),
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  durationMonths: z.number().int().min(1).max(12),
  timeCommitmentHrsWeek: z.number().int().min(1).max(40),
});

// Credit Transaction Validation Schemas
export const creditTransactionTypeSchema = z.enum(CREDIT_TRANSACTION_TYPES);

export const adjustCreditsSchema = z.object({
  amount: z.number().int().min(-100000).max(100000),
  description: z.string().min(5).max(500),
});

// Time Log Validation Schemas
export const logTimeSchema = z.object({
  hoursWorked: z.number().int().min(0).max(24),
  workDate: z.date(),
  notes: z.string().max(1000).optional(),
});

// Export all schemas for convenience
export const schemas = {
  // User
  createUser: createUserSchema,
  login: loginSchema,
  register: registerSchema,

  // Company
  createCompany: createCompanySchema,
  updateCompany: updateCompanySchema,

  // Skills
  addSkill: addSkillSchema,
  createSkill: createSkillSchema,
  setAvailability: setAvailabilitySchema,

  // Missions
  createMission: createMissionSchema,
  submitApproval: submitApprovalSchema,

  // Skill Needs
  createSkillNeed: createSkillNeedSchema,

  // Credits
  adjustCredits: adjustCreditsSchema,

  // Time Logs
  logTime: logTimeSchema,
};
