import { describe, it, expect } from 'vitest';
import { Company } from '../../src/entities/Company';

describe('Company Entity', () => {
  describe('Company creation', () => {
    it('should create a valid company with all required fields', () => {
      const company = new Company({
        id: 'company-123',
        name: 'Tech Startup Ltd',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'INVITE01',
        creditBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(company.id).toBe('company-123');
      expect(company.name).toBe('Tech Startup Ltd');
      expect(company.industry).toBe('Technology');
      expect(company.size).toBe('11-50');
      expect(company.location).toBe('FR');
      expect(company.creditBalance).toBe(0);
    });

    it('should reject company with empty name', () => {
      expect(() => {
        new Company({
          id: 'company-123',
          name: '',
          industry: 'Technology',
          size: '11-50',
          location: 'FR',
          inviteCode: 'INVITE01',
          creditBalance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }).toThrow('Company name cannot be empty');
    });

    it('should reject company with invalid industry', () => {
      expect(() => {
        new Company({
          id: 'company-123',
          name: 'Tech Startup Ltd',
          industry: '',
          size: '11-50',
          location: 'FR',
          inviteCode: 'INVITE01',
          creditBalance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }).toThrow('Industry cannot be empty');
    });

    it('should reject company with invalid size', () => {
      expect(() => {
        new Company({
          id: 'company-123',
          name: 'Tech Startup Ltd',
          industry: 'Technology',
          size: 'invalid-size' as any,
          location: 'FR',
          inviteCode: 'INVITE01',
          creditBalance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }).toThrow('Invalid company size');
    });

    it('should reject company with invalid location', () => {
      expect(() => {
        new Company({
          id: 'company-123',
          name: 'Tech Startup Ltd',
          industry: 'Technology',
          size: '11-50',
          location: 'US' as any, // Only FR and UK are valid
          inviteCode: 'INVITE01',
          creditBalance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }).toThrow('Location must be FR or UK');
    });
  });

  describe('Company updates', () => {
    it('should allow updating company industry', () => {
      const company = new Company({
        id: 'company-123',
        name: 'Tech Startup Ltd',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'INVITE01',
        creditBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      company.updateIndustry('Healthcare');

      expect(company.industry).toBe('Healthcare');
    });

    it('should allow updating company size', () => {
      const company = new Company({
        id: 'company-123',
        name: 'Tech Startup Ltd',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'INVITE01',
        creditBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      company.updateSize('51-200');

      expect(company.size).toBe('51-200');
    });

    it('should reject updating to invalid size', () => {
      const company = new Company({
        id: 'company-123',
        name: 'Tech Startup Ltd',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'INVITE01',
        creditBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => {
        company.updateSize('invalid' as any);
      }).toThrow('Invalid company size');
    });
  });

  describe('Credit management', () => {
    it('should initialize with zero credit balance', () => {
      const company = new Company({
        id: 'company-123',
        name: 'Tech Startup Ltd',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'INVITE01',
        creditBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(company.creditBalance).toBe(0);
    });

    it('should allow negative credit balance', () => {
      const company = new Company({
        id: 'company-123',
        name: 'Tech Startup Ltd',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'INVITE01',
        creditBalance: -100,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(company.creditBalance).toBe(-100);
      expect(company.hasNegativeBalance()).toBe(true);
    });
  });

  describe('Invite code', () => {
    it('should have a valid 8-character invite code', () => {
      const company = new Company({
        id: 'company-123',
        name: 'Tech Startup Ltd',
        industry: 'Technology',
        size: '11-50',
        location: 'FR',
        inviteCode: 'ABCD1234',
        creditBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(company.inviteCode).toBe('ABCD1234');
      expect(company.inviteCode.length).toBe(8);
    });

    it('should reject invite code shorter than 8 characters', () => {
      expect(() => {
        new Company({
          id: 'company-123',
          name: 'Tech Startup Ltd',
          industry: 'Technology',
          size: '11-50',
          location: 'FR',
          inviteCode: 'ABC123',
          creditBalance: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }).toThrow('Invite code must be 8 characters');
    });
  });
});
