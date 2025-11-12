import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDatabase } from './setup/test-db';
import { companies, users } from '@es-mono/database/schema';
import type { DB } from '@es-mono/database';
import {
  UpdateCompanyProfile,
  GetCompany,
  ValidateInviteCode,
  ListCompanies,
} from '@es-mono/domain';
import { DrizzleCompanyRepository } from '../../src/repositories/implementations/DrizzleCompanyRepository';

describe('Company Onboarding Integration Tests', () => {
  let testDb: DB;
  let cleanup: () => Promise<void>;
  let testUserId: string;
  let testCompanyId: string;
  let companyRepository: DrizzleCompanyRepository;

  beforeAll(async () => {
    const result = await createTestDatabase();
    testDb = result.db;
    cleanup = result.cleanup;

    // Initialize repository
    companyRepository = new DrizzleCompanyRepository(testDb);

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
      const updateCompanyProfile = new UpdateCompanyProfile(companyRepository);

      const updatedCompany = await updateCompanyProfile.execute({
        companyId: testCompanyId,
        updates: {
          industry: 'Healthcare',
          size: '51-200',
        },
      });

      const companyData = updatedCompany.toObject();
      expect(companyData.industry).toBe('Healthcare');
      expect(companyData.size).toBe('51-200');
    });

    it('should validate company data during profile completion', async () => {
      const updateCompanyProfile = new UpdateCompanyProfile(companyRepository);

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
      const getCompany = new GetCompany(companyRepository);
      const company = await getCompany.execute(testCompanyId);

      const companyData = company.toObject();
      expect(companyData).toBeDefined();
      expect(companyData.id).toBe(testCompanyId);
      expect(companyData.name).toContain('Test Company');
      expect(companyData.creditBalance).toBe(0);
    });
  });

  describe('Validate invite code', () => {
    it('should validate a correct invite code', async () => {
      const validateInviteCode = new ValidateInviteCode(companyRepository);

      const existingCompany = await testDb.query.companies.findFirst({
        where: (companies, { eq }) => eq(companies.id, testCompanyId),
      });

      const isValid = await validateInviteCode.execute(existingCompany!.inviteCode);

      expect(isValid).toBe(true);
    });

    it('should reject an invalid invite code', async () => {
      const validateInviteCode = new ValidateInviteCode(companyRepository);

      const isValid = await validateInviteCode.execute('INVALID1');

      expect(isValid).toBe(false);
    });
  });

  describe('List companies in network', () => {
    it('should retrieve all companies in the network', async () => {
      const listCompanies = new ListCompanies(companyRepository);
      const companiesList = await listCompanies.execute();

      expect(companiesList).toBeDefined();
      expect(Array.isArray(companiesList)).toBe(true);
      expect(companiesList.length).toBeGreaterThan(0);

      const companiesData = companiesList.map((c) => c.toObject());
      expect(companiesData.some((c) => c.id === testCompanyId)).toBe(true);
    });
  });
});
