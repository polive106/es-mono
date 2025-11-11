import { beforeAll } from 'vitest';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { resolve } from 'path';

// Use shared in-memory SQLite database for tests
// The ?mode=memory&cache=shared allows multiple connections to share the same in-memory database
const TEST_DB_URL = 'file:test-db?mode=memory&cache=shared';

// Set the DATABASE_URL before any database module imports
process.env.DATABASE_URL = TEST_DB_URL;

// Create the shared in-memory database and keep it open
const sqlite = new Database(TEST_DB_URL);

beforeAll(async () => {
  // Create test database schema from migrations
  const testDb = drizzle(sqlite);

  // Run migrations from the database package
  const migrationsFolder = resolve(process.cwd(), '../database/migrations');

  try {
    migrate(testDb, { migrationsFolder });
    console.log('✅ In-memory test database initialized');
  } catch (error) {
    console.error('❌ Test database migration failed:', error);
    throw error;
  }
});
