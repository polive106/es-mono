import type { vi } from 'vitest';
import type {
  User,
  NewUser,
  Company,
  Session,
  NewSession,
  UserRole,
  Role,
} from '@es-mono/database/schema';
import type {
  IUserRepository,
  ICompanyRepository,
  ISessionRepository,
  IUserRoleRepository,
} from '../../../src/repositories/interfaces';

/**
 * Mock User Repository for Unit Tests
 *
 * Provides an in-memory implementation of IUserRepository that can be
 * easily controlled and inspected in tests.
 */
export class MockUserRepository implements IUserRepository {
  findByEmail = vi.fn<[string], Promise<User | null>>();
  findById = vi.fn<[string], Promise<User | null>>();
  findByIdWithCompany = vi.fn<[string], Promise<(User & { company: Company }) | null>>();
  create = vi.fn<[NewUser], Promise<User>>();
  updatePassword = vi.fn<[string, string], Promise<void>>();
  updateLastActivity = vi.fn<[string, Date], Promise<void>>();

  /**
   * Reset all mocks to their default state
   */
  reset() {
    this.findByEmail.mockReset();
    this.findById.mockReset();
    this.findByIdWithCompany.mockReset();
    this.create.mockReset();
    this.updatePassword.mockReset();
    this.updateLastActivity.mockReset();
  }
}

/**
 * Mock Company Repository for Unit Tests
 */
export class MockCompanyRepository implements ICompanyRepository {
  findByInviteCode = vi.fn<[string], Promise<Company | null>>();
  findById = vi.fn<[string], Promise<Company | null>>();

  reset() {
    this.findByInviteCode.mockReset();
    this.findById.mockReset();
  }
}

/**
 * Mock Session Repository for Unit Tests
 */
export class MockSessionRepository implements ISessionRepository {
  create = vi.fn<[NewSession], Promise<void>>();
  findById = vi.fn<[string], Promise<Session | null>>();
  findByIdWithUser = vi.fn<[string], Promise<{ session: Session; user: User } | null>>();
  updateExpiration = vi.fn<[string, Date], Promise<void>>();
  delete = vi.fn<[string], Promise<void>>();
  deleteByUserId = vi.fn<[string], Promise<void>>();
  deleteExpired = vi.fn<[], Promise<number>>();

  reset() {
    this.create.mockReset();
    this.findById.mockReset();
    this.findByIdWithUser.mockReset();
    this.updateExpiration.mockReset();
    this.delete.mockReset();
    this.deleteByUserId.mockReset();
    this.deleteExpired.mockReset();
  }
}

/**
 * Mock UserRole Repository for Unit Tests
 */
export class MockUserRoleRepository implements IUserRoleRepository {
  findByUserIdWithRoles = vi.fn<[string], Promise<Array<UserRole & { role: Role }>>>();

  reset() {
    this.findByUserIdWithRoles.mockReset();
  }
}

/**
 * Create a set of mock repositories for testing
 */
export function createMockRepositories() {
  return {
    userRepo: new MockUserRepository(),
    companyRepo: new MockCompanyRepository(),
    sessionRepo: new MockSessionRepository(),
    userRoleRepo: new MockUserRoleRepository(),
  };
}
