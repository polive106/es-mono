import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  languageSchema,
  createUserSchema,
  loginSchema,
  createCompanySchema,
  updateCompanySchema,
  addSkillSchema,
  createSkillSchema,
  setAvailabilitySchema,
  createMissionSchema,
  submitApprovalSchema,
  createSkillNeedSchema,
  adjustCreditsSchema,
  logTimeSchema,
} from './index';

describe('Validation Schemas', () => {
  describe('Basic Field Schemas', () => {
    describe('emailSchema', () => {
      it('should accept valid email addresses', () => {
        const validEmails = [
          'test@example.com',
          'user.name@company.co.uk',
          'admin+test@domain.org',
        ];

        validEmails.forEach((email) => {
          const result = emailSchema.safeParse(email);
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid email addresses', () => {
        const invalidEmails = ['notanemail', '@example.com', 'user@', 'user @example.com', ''];

        invalidEmails.forEach((email) => {
          const result = emailSchema.safeParse(email);
          expect(result.success).toBe(false);
        });
      });

      it('should reject emails longer than 255 characters', () => {
        const longEmail = 'a'.repeat(250) + '@test.com';
        const result = emailSchema.safeParse(longEmail);
        expect(result.success).toBe(false);
      });
    });

    describe('passwordSchema', () => {
      it('should accept passwords with 12+ characters', () => {
        const validPasswords = ['12CharactersLong', 'SecurePassword123!', 'A'.repeat(100)];

        validPasswords.forEach((password) => {
          const result = passwordSchema.safeParse(password);
          expect(result.success).toBe(true);
        });
      });

      it('should reject passwords shorter than 12 characters', () => {
        const invalidPasswords = ['short', 'only11chars'];

        invalidPasswords.forEach((password) => {
          const result = passwordSchema.safeParse(password);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toContain('at least 12 characters');
          }
        });
      });
    });

    describe('nameSchema', () => {
      it('should accept names between 2-100 characters', () => {
        const validNames = ['Jo', 'John Doe', 'A'.repeat(100)];

        validNames.forEach((name) => {
          const result = nameSchema.safeParse(name);
          expect(result.success).toBe(true);
        });
      });

      it('should reject names shorter than 2 characters', () => {
        const result = nameSchema.safeParse('A');
        expect(result.success).toBe(false);
      });

      it('should reject names longer than 100 characters', () => {
        const result = nameSchema.safeParse('A'.repeat(101));
        expect(result.success).toBe(false);
      });
    });

    describe('languageSchema', () => {
      it('should accept valid language codes', () => {
        const result1 = languageSchema.safeParse('en');
        const result2 = languageSchema.safeParse('fr');

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);
      });

      it('should reject invalid language codes', () => {
        const result = languageSchema.safeParse('es');
        expect(result.success).toBe(false);
      });
    });
  });

  describe('User Schemas', () => {
    describe('createUserSchema', () => {
      it('should accept valid user data', () => {
        const validUser = {
          email: 'test@example.com',
          password: 'SecurePassword123!',
          name: 'John Doe',
          languagePref: 'en' as const,
          companyId: '550e8400-e29b-41d4-a716-446655440000',
          inviteCode: 'ABCD1234',
        };

        const result = createUserSchema.safeParse(validUser);
        expect(result.success).toBe(true);
      });

      it('should use default language preference of "en"', () => {
        const userData = {
          email: 'test@example.com',
          password: 'SecurePassword123!',
          name: 'John Doe',
          companyId: '550e8400-e29b-41d4-a716-446655440000',
          inviteCode: 'ABCD1234',
        };

        const result = createUserSchema.safeParse(userData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.languagePref).toBe('en');
        }
      });

      it('should reject invalid UUID for companyId', () => {
        const invalidUser = {
          email: 'test@example.com',
          password: 'SecurePassword123!',
          name: 'John Doe',
          languagePref: 'en' as const,
          companyId: 'not-a-uuid',
          inviteCode: 'ABCD1234',
        };

        const result = createUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
      });

      it('should reject invite code that is not 8 characters', () => {
        const invalidUser = {
          email: 'test@example.com',
          password: 'SecurePassword123!',
          name: 'John Doe',
          languagePref: 'en' as const,
          companyId: '550e8400-e29b-41d4-a716-446655440000',
          inviteCode: 'SHORT',
        };

        const result = createUserSchema.safeParse(invalidUser);
        expect(result.success).toBe(false);
      });
    });

    describe('loginSchema', () => {
      it('should accept valid login credentials', () => {
        const validLogin = {
          email: 'test@example.com',
          password: 'anypassword',
        };

        const result = loginSchema.safeParse(validLogin);
        expect(result.success).toBe(true);
      });

      it('should reject invalid email', () => {
        const invalidLogin = {
          email: 'not-an-email',
          password: 'anypassword',
        };

        const result = loginSchema.safeParse(invalidLogin);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Company Schemas', () => {
    describe('createCompanySchema', () => {
      it('should accept valid company data', () => {
        const validCompany = {
          name: 'Acme Corp',
          industry: 'Technology',
          size: '51-200' as const,
          location: 'FR' as const,
        };

        const result = createCompanySchema.safeParse(validCompany);
        expect(result.success).toBe(true);
      });

      it('should reject company name shorter than 2 characters', () => {
        const invalidCompany = {
          name: 'A',
          industry: 'Technology',
          size: '51-200' as const,
          location: 'FR' as const,
        };

        const result = createCompanySchema.safeParse(invalidCompany);
        expect(result.success).toBe(false);
      });

      it('should reject invalid company size', () => {
        const invalidCompany = {
          name: 'Acme Corp',
          industry: 'Technology',
          size: 'huge',
          location: 'FR' as const,
        };

        const result = createCompanySchema.safeParse(invalidCompany);
        expect(result.success).toBe(false);
      });
    });

    describe('updateCompanySchema', () => {
      it('should accept partial updates', () => {
        const partialUpdate = {
          name: 'New Name',
        };

        const result = updateCompanySchema.safeParse(partialUpdate);
        expect(result.success).toBe(true);
      });

      it('should accept empty updates', () => {
        const result = updateCompanySchema.safeParse({});
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Skill Schemas', () => {
    describe('addSkillSchema', () => {
      it('should accept valid skill data', () => {
        const validSkill = {
          skillId: '550e8400-e29b-41d4-a716-446655440000',
          proficiencyLevel: 'intermediate' as const,
          yearsExperience: 3,
        };

        const result = addSkillSchema.safeParse(validSkill);
        expect(result.success).toBe(true);
      });

      it('should accept skill without yearsExperience', () => {
        const validSkill = {
          skillId: '550e8400-e29b-41d4-a716-446655440000',
          proficiencyLevel: 'expert' as const,
        };

        const result = addSkillSchema.safeParse(validSkill);
        expect(result.success).toBe(true);
      });

      it('should reject negative years of experience', () => {
        const invalidSkill = {
          skillId: '550e8400-e29b-41d4-a716-446655440000',
          proficiencyLevel: 'intermediate' as const,
          yearsExperience: -1,
        };

        const result = addSkillSchema.safeParse(invalidSkill);
        expect(result.success).toBe(false);
      });

      it('should reject years of experience over 50', () => {
        const invalidSkill = {
          skillId: '550e8400-e29b-41d4-a716-446655440000',
          proficiencyLevel: 'intermediate' as const,
          yearsExperience: 51,
        };

        const result = addSkillSchema.safeParse(invalidSkill);
        expect(result.success).toBe(false);
      });
    });

    describe('createSkillSchema', () => {
      it('should accept valid skill creation data', () => {
        const validSkill = {
          name: 'JavaScript',
          category: 'Programming',
          description: 'A versatile programming language',
        };

        const result = createSkillSchema.safeParse(validSkill);
        expect(result.success).toBe(true);
      });

      it('should accept skill without description', () => {
        const validSkill = {
          name: 'JavaScript',
          category: 'Programming',
        };

        const result = createSkillSchema.safeParse(validSkill);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Availability Schema', () => {
    describe('setAvailabilitySchema', () => {
      it('should accept valid availability data', () => {
        const validAvailability = {
          availabilityPct: 50,
          isAvailable: true,
          isAnonymized: false,
          activeFrom: new Date('2024-01-01'),
          activeUntil: new Date('2024-12-31'),
        };

        const result = setAvailabilitySchema.safeParse(validAvailability);
        expect(result.success).toBe(true);
      });

      it('should use default value true for isAnonymized', () => {
        const availability = {
          availabilityPct: 50,
          isAvailable: true,
        };

        const result = setAvailabilitySchema.safeParse(availability);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.isAnonymized).toBe(true);
        }
      });

      it('should reject availability percentage below 0', () => {
        const invalidAvailability = {
          availabilityPct: -1,
          isAvailable: true,
          isAnonymized: true,
        };

        const result = setAvailabilitySchema.safeParse(invalidAvailability);
        expect(result.success).toBe(false);
      });

      it('should reject availability percentage above 100', () => {
        const invalidAvailability = {
          availabilityPct: 101,
          isAvailable: true,
          isAnonymized: true,
        };

        const result = setAvailabilitySchema.safeParse(invalidAvailability);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Mission Schemas', () => {
    describe('createMissionSchema', () => {
      it('should accept valid mission data', () => {
        const validMission = {
          receivingCompanyId: '550e8400-e29b-41d4-a716-446655440000',
          talentUserId: '550e8400-e29b-41d4-a716-446655440001',
          skillNeedId: '550e8400-e29b-41d4-a716-446655440002',
          durationMonths: 6,
          timeCommitmentHrsWeek: 20,
          creditValue: 100,
        };

        const result = createMissionSchema.safeParse(validMission);
        expect(result.success).toBe(true);
      });

      it('should reject duration less than 1 month', () => {
        const invalidMission = {
          receivingCompanyId: '550e8400-e29b-41d4-a716-446655440000',
          talentUserId: '550e8400-e29b-41d4-a716-446655440001',
          durationMonths: 0,
          timeCommitmentHrsWeek: 20,
          creditValue: 100,
        };

        const result = createMissionSchema.safeParse(invalidMission);
        expect(result.success).toBe(false);
      });

      it('should reject duration more than 12 months', () => {
        const invalidMission = {
          receivingCompanyId: '550e8400-e29b-41d4-a716-446655440000',
          talentUserId: '550e8400-e29b-41d4-a716-446655440001',
          durationMonths: 13,
          timeCommitmentHrsWeek: 20,
          creditValue: 100,
        };

        const result = createMissionSchema.safeParse(invalidMission);
        expect(result.success).toBe(false);
      });

      it('should reject time commitment more than 40 hours per week', () => {
        const invalidMission = {
          receivingCompanyId: '550e8400-e29b-41d4-a716-446655440000',
          talentUserId: '550e8400-e29b-41d4-a716-446655440001',
          durationMonths: 6,
          timeCommitmentHrsWeek: 41,
          creditValue: 100,
        };

        const result = createMissionSchema.safeParse(invalidMission);
        expect(result.success).toBe(false);
      });
    });

    describe('submitApprovalSchema', () => {
      it('should accept valid approval submission', () => {
        const validApproval = {
          status: 'approved' as const,
          comments: 'Looks good',
        };

        const result = submitApprovalSchema.safeParse(validApproval);
        expect(result.success).toBe(true);
      });

      it('should accept approval without comments', () => {
        const validApproval = {
          status: 'rejected' as const,
        };

        const result = submitApprovalSchema.safeParse(validApproval);
        expect(result.success).toBe(true);
      });

      it('should reject comments longer than 500 characters', () => {
        const invalidApproval = {
          status: 'approved' as const,
          comments: 'A'.repeat(501),
        };

        const result = submitApprovalSchema.safeParse(invalidApproval);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Skill Need Schema', () => {
    describe('createSkillNeedSchema', () => {
      it('should accept valid skill need data', () => {
        const validSkillNeed = {
          skillId: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Senior React Developer',
          description: 'We need a senior React developer with 5+ years of experience',
          durationMonths: 6,
          timeCommitmentHrsWeek: 30,
        };

        const result = createSkillNeedSchema.safeParse(validSkillNeed);
        expect(result.success).toBe(true);
      });

      it('should reject description shorter than 10 characters', () => {
        const invalidSkillNeed = {
          skillId: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Senior React Developer',
          description: 'Short',
          durationMonths: 6,
          timeCommitmentHrsWeek: 30,
        };

        const result = createSkillNeedSchema.safeParse(invalidSkillNeed);
        expect(result.success).toBe(false);
      });

      it('should reject description longer than 2000 characters', () => {
        const invalidSkillNeed = {
          skillId: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Senior React Developer',
          description: 'A'.repeat(2001),
          durationMonths: 6,
          timeCommitmentHrsWeek: 30,
        };

        const result = createSkillNeedSchema.safeParse(invalidSkillNeed);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Credit Transaction Schema', () => {
    describe('adjustCreditsSchema', () => {
      it('should accept positive credit adjustment', () => {
        const validAdjustment = {
          amount: 100,
          description: 'Credit for completed mission',
        };

        const result = adjustCreditsSchema.safeParse(validAdjustment);
        expect(result.success).toBe(true);
      });

      it('should accept negative credit adjustment', () => {
        const validAdjustment = {
          amount: -50,
          description: 'Debit for mission received',
        };

        const result = adjustCreditsSchema.safeParse(validAdjustment);
        expect(result.success).toBe(true);
      });

      it('should reject amount below -100000', () => {
        const invalidAdjustment = {
          amount: -100001,
          description: 'Too large debit',
        };

        const result = adjustCreditsSchema.safeParse(invalidAdjustment);
        expect(result.success).toBe(false);
      });

      it('should reject amount above 100000', () => {
        const invalidAdjustment = {
          amount: 100001,
          description: 'Too large credit',
        };

        const result = adjustCreditsSchema.safeParse(invalidAdjustment);
        expect(result.success).toBe(false);
      });

      it('should reject description shorter than 5 characters', () => {
        const invalidAdjustment = {
          amount: 100,
          description: 'OK',
        };

        const result = adjustCreditsSchema.safeParse(invalidAdjustment);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Time Log Schema', () => {
    describe('logTimeSchema', () => {
      it('should accept valid time log', () => {
        const validTimeLog = {
          hoursWorked: 8,
          workDate: new Date('2024-01-15'),
          notes: 'Worked on API development',
        };

        const result = logTimeSchema.safeParse(validTimeLog);
        expect(result.success).toBe(true);
      });

      it('should accept time log without notes', () => {
        const validTimeLog = {
          hoursWorked: 8,
          workDate: new Date('2024-01-15'),
        };

        const result = logTimeSchema.safeParse(validTimeLog);
        expect(result.success).toBe(true);
      });

      it('should reject negative hours', () => {
        const invalidTimeLog = {
          hoursWorked: -1,
          workDate: new Date('2024-01-15'),
        };

        const result = logTimeSchema.safeParse(invalidTimeLog);
        expect(result.success).toBe(false);
      });

      it('should reject hours more than 24', () => {
        const invalidTimeLog = {
          hoursWorked: 25,
          workDate: new Date('2024-01-15'),
        };

        const result = logTimeSchema.safeParse(invalidTimeLog);
        expect(result.success).toBe(false);
      });

      it('should reject notes longer than 1000 characters', () => {
        const invalidTimeLog = {
          hoursWorked: 8,
          workDate: new Date('2024-01-15'),
          notes: 'A'.repeat(1001),
        };

        const result = logTimeSchema.safeParse(invalidTimeLog);
        expect(result.success).toBe(false);
      });
    });
  });
});
