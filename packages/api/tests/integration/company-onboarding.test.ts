import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDatabase } from './setup/test-db';
import { companies, users } from '@es-mono/database/schema';
import type { DB } from '@es-mono/database';

describe('Company Onboarding Integration Tests', () => {
  let testDb: DB;
  let cleanup: () => Promise<void>;
  let testUserId: string;
  let testCompanyId: string;

  beforeAll(async () => {
    const result = await createTestDatabase();
    testDb = result.db;
    cleanup = result.cleanup;

    // Create a test company with invite code
    const timestamp = Date.now();
    const [company] = await testDb
      .insert(companies)
      .values({
        name: `Test Company ${timestamp}`,
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: `TEST${timestamp.toString().slice(-4)}`,
      })
      .returning();
    testCompanyId = company.id;

    // Create a test user (HR manager) for the company
    const [user] = await testDb
      .insert(users)
      .values({
        email: `hr-${timestamp}@testcompany.com`,
        passwordHash: 'hashed_password_placeholder',
        name: 'HR Manager',
        languagePref: 'en',
        companyId: testCompanyId,
      })
      .returning();
    testUserId = user.id;
  });

  afterAll(async () => {
    await cleanup();
  });

  describe('Complete company profile', () => {
    it('should allow company to update its profile information', async () => {
      // This test will FAIL because the update company use case doesn't exist yet
      const { UpdateCompanyProfile } = await import(
        '../../src/domain/use-cases/companies/UpdateCompanyProfile'
      );

      const updateCompanyProfile = new UpdateCompanyProfile();

      const updatedCompany = await updateCompanyProfile.execute({
        companyId: testCompanyId,
        updates: {
          industry: 'Healthcare',
          size: '51-200',
        },
      });

      expect(updatedCompany.industry).toBe('Healthcare');
      expect(updatedCompany.size).toBe('51-200');
    });

    it('should validate company data during profile completion', async () => {
      const { UpdateCompanyProfile } = await import(
        '../../src/domain/use-cases/companies/UpdateCompanyProfile'
      );

      const updateCompanyProfile = new UpdateCompanyProfile();

      // Should reject invalid industry
      await expect(
        updateCompanyProfile.execute({
          companyId: testCompanyId,
          updates: {
            industry: '',
            size: '11-50',
          },
        })
      ).rejects.toThrow('Invalid industry');
    });
  });

  describe('View company profile', () => {
    it('should retrieve company profile by ID', async () => {
      // This test will FAIL because the get company use case doesn't exist yet
      const { GetCompany } = await import('../../src/domain/use-cases/companies/GetCompany');

      const getCompany = new GetCompany();
      const company = await getCompany.execute(testCompanyId);

      expect(company).toBeDefined();
      expect(company.id).toBe(testCompanyId);
      expect(company.name).toContain('Test Company');
      expect(company.creditBalance).toBe(0);
    });
  });

  describe('Validate invite code', () => {
    it('should validate a correct invite code', async () => {
      // This test will FAIL because the validate invite code use case doesn't exist yet
      const { ValidateInviteCode } = await import(
        '../../src/domain/use-cases/companies/ValidateInviteCode'
      );

      const validateInviteCode = new ValidateInviteCode();

      const existingCompany = await testDb.query.companies.findFirst({
        where: (companies, { eq }) => eq(companies.id, testCompanyId),
      });

      const isValid = await validateInviteCode.execute(existingCompany!.inviteCode);

      expect(isValid).toBe(true);
    });

    it('should reject an invalid invite code', async () => {
      const { ValidateInviteCode } = await import(
        '../../src/domain/use-cases/companies/ValidateInviteCode'
      );

      const validateInviteCode = new ValidateInviteCode();

      const isValid = await validateInviteCode.execute('INVALID123');

      expect(isValid).toBe(false);
    });
  });

  describe('List companies in network', () => {
    it('should retrieve all companies in the network', async () => {
      // This test will FAIL because the list companies use case doesn't exist yet
      const { ListCompanies } = await import('../../src/domain/use-cases/companies/ListCompanies');

      const listCompanies = new ListCompanies();
      const companiesList = await listCompanies.execute();

      expect(companiesList).toBeDefined();
      expect(Array.isArray(companiesList)).toBe(true);
      expect(companiesList.length).toBeGreaterThan(0);
      expect(companiesList.some((c) => c.id === testCompanyId)).toBe(true);
    });
  });
});
