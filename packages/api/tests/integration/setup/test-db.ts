import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { resolve } from 'path';
import { unlink } from 'fs/promises';
import * as schema from '@es-mono/database/schema';
import type { DB } from '@es-mono/database';

/**
 * Test Database Configuration
 */
export interface TestDatabase {
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
   * Cleanup function to close and delete the database
   */
  cleanup: () => Promise<void>;
}

/**
 * Create a temporary SQLite database for integration testing
 *
 * Creates a file-based SQLite database with a unique name, runs migrations,
 * and returns utilities for using and cleaning up the database.
 *
 * @example
 * ```typescript
 * describe('Auth Integration Tests', () => {
 *   let testDb: DB;
 *   let cleanup: () => Promise<void>;
 *
 *   beforeAll(async () => {
 *     const result = await createTestDatabase();
 *     testDb = result.db;
 *     cleanup = result.cleanup;
 *   });
 *
 *   afterAll(async () => {
 *     await cleanup();
 *   });
 * });
 * ```
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  // Create unique database file path
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const dbPath = resolve(process.cwd(), `test-${timestamp}-${random}.db`);

  // Create SQLite database
  const sqlite = new Database(dbPath);

  // Create Drizzle instance
  const db = drizzle(sqlite, { schema });

  // Run migrations from the database package
  const migrationsFolder = resolve(process.cwd(), '../database/migrations');

  try {
    migrate(db, { migrationsFolder });
  } catch (error) {
    // Clean up on migration failure
    sqlite.close();
    try {
      await unlink(dbPath);
    } catch {
      // Ignore cleanup errors
    }
    throw new Error(`Test database migration failed: ${error}`);
  }

  // Create cleanup function
  const cleanup = async () => {
    try {
      sqlite.close();
    } catch (error) {
      console.error('Error closing test database:', error);
    }

    try {
      await unlink(dbPath);
    } catch (error) {
      // Database file might not exist or already be deleted
      // This is not a critical error
    }
  };

  return {
    db,
    sqlite,
    dbPath,
    cleanup,
  };
}

/**
 * Create multiple test databases for parallel testing
 *
 * Useful when you need isolated databases for different test suites
 * that run concurrently.
 */
export async function createTestDatabases(count: number): Promise<TestDatabase[]> {
  const databases: TestDatabase[] = [];

  for (let i = 0; i < count; i++) {
    const testDb = await createTestDatabase();
    databases.push(testDb);
  }

  return databases;
}

/**
 * Cleanup multiple test databases
 */
export async function cleanupTestDatabases(databases: TestDatabase[]): Promise<void> {
  await Promise.all(databases.map((db) => db.cleanup()));
}
