import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { resolve } from 'path';
import { unlink } from 'fs/promises';
import * as schema from '../../../packages/database/src/schema';
import { companies } from '../../../packages/database/src/schema';
import type { DB } from '../../../packages/database';
import { eq } from 'drizzle-orm';

/**
 * E2E Test Database Configuration
 */
export interface E2EDatabase {
  /**
   * The Drizzle database instance
   */
  db: DB;

  /**
   * The raw SQLite database instance
   */
  sqlite: Database.Database;

  /**
   * The path to the database file
   */
  dbPath: string;

  /**
   * Test company data seeded in the database
   */
  testCompany: {
    id: string;
    name: string;
    inviteCode: string;
  };

  /**
   * Cleanup function to delete the database
   */
  cleanup: () => Promise<void>;
}

/**
 * Create a persistent E2E database for testing
 *
 * Creates a file-based SQLite database at packages/api/test-e2e.db,
 * runs migrations, and seeds it with test company data.
 *
 * The database persists across test runs (not deleted between tests)
 * but tests should clean up their own data in afterEach hooks.
 *
 * @example
 * ```typescript
 * // In test setup
 * beforeAll(async () => {
 *   const { testCompany, cleanup } = await setupE2EDatabase();
 *   globalTestCompany = testCompany;
 *   globalCleanup = cleanup;
 * });
 *
 * // Clean up between tests
 * afterEach(async () => {
 *   await db.delete(users).where(sql`email LIKE 'test-%@%'`);
 * });
 *
 * // Clean up after all tests
 * afterAll(async () => {
 *   await globalCleanup();
 * });
 * ```
 */
export async function setupE2EDatabase(): Promise<E2EDatabase> {
  // Database will be created in packages/api directory
  const dbPath = resolve(__dirname, '../../../packages/api/test-e2e.db');

  // Delete if exists (fresh start for each test run)
  try {
    await unlink(dbPath);
  } catch {
    // File doesn't exist, that's fine
  }

  // Create SQLite database
  const sqlite = new Database(dbPath);

  // Create Drizzle instance
  const db = drizzle(sqlite, { schema });

  // Run migrations from the database package
  const migrationsFolder = resolve(__dirname, '../../../packages/database/migrations');
  console.log(`[E2E Setup] Migrations folder: ${migrationsFolder}`);
  console.log(`[E2E Setup] __dirname: ${__dirname}`);

  try {
    migrate(db, { migrationsFolder });
    console.log(`[E2E Setup] Migrations completed successfully`);
  } catch (error) {
    // Clean up on migration failure
    sqlite.close();
    try {
      await unlink(dbPath);
    } catch {
      // Ignore cleanup errors
    }
    throw new Error(`E2E database migration failed: ${error}`);
  }

  // Seed with test company
  const [testCompany] = await db
    .insert(companies)
    .values({
      name: 'E2E Test Company',
      industry: 'Technology',
      size: '11-50',
      location: 'FR',
      inviteCode: 'E2E12345',
    })
    .returning();

  // Create cleanup function
  const cleanup = async () => {
    try {
      sqlite.close();
    } catch (error) {
      console.error('Error closing E2E database:', error);
    }

    try {
      await unlink(dbPath);
    } catch (error) {
      // Database file might not exist, that's okay
      console.warn('Could not delete E2E database file:', error);
    }
  };

  return {
    db,
    sqlite,
    dbPath,
    testCompany: {
      id: testCompany.id,
      name: testCompany.name,
      inviteCode: testCompany.inviteCode,
    },
    cleanup,
  };
}

/**
 * Connect to existing E2E database
 *
 * Used in tests to connect to the database that was created in global setup.
 * Does NOT create a new database or run migrations.
 *
 * @example
 * ```typescript
 * // In test file
 * let e2eDb: E2EDatabase;
 *
 * test.beforeAll(async () => {
 *   e2eDb = await connectToE2EDatabase();
 * });
 * ```
 */
export async function connectToE2EDatabase(): Promise<E2EDatabase> {
  // Connect to existing database
  const dbPath = resolve(__dirname, '../../../packages/api/test-e2e.db');
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });

  // Get test company from database
  const testCompany = await db.query.companies.findFirst({
    where: eq(companies.inviteCode, 'E2E12345'),
  });

  if (!testCompany) {
    throw new Error('Test company not found in E2E database');
  }

  // No-op cleanup (database is cleaned up in global teardown)
  const cleanup = async () => {
    try {
      sqlite.close();
    } catch (error) {
      console.error('Error closing E2E database connection:', error);
    }
  };

  return {
    db,
    sqlite,
    dbPath,
    testCompany: {
      id: testCompany.id,
      name: testCompany.name,
      inviteCode: testCompany.inviteCode,
    },
    cleanup,
  };
}
