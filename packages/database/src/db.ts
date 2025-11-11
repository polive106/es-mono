import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { join } from 'path';

// Use absolute path to database file in monorepo root
// Assumes commands are run from monorepo root (which turborepo does)
// Strip 'file:' protocol if present (for compatibility with different URL formats)
function getDbPath(): string {
  let dbPath = process.env.DATABASE_URL || join(process.cwd(), 'local.db');
  if (dbPath.startsWith('file:')) {
    dbPath = dbPath.substring(5); // Remove 'file:' prefix
  }
  return dbPath;
}

// Type for the database instance with schema
type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

// Lazy initialization - connection is created on first access, not at module import
let _db: DrizzleDB | null = null;
let _sqlite: Database.Database | null = null;

function initializeDatabase(): DrizzleDB {
  if (_db) return _db;

  const dbPath = getDbPath();
  console.error(`[Database] Connecting to: ${dbPath}`);

  _sqlite = new Database(dbPath);
  _db = drizzle(_sqlite, { schema });

  // For test databases, verify schema exists after connection
  if (process.env.NODE_ENV === 'test' && dbPath.includes('test-e2e')) {
    try {
      const tables = _sqlite!.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").all();
      if (tables.length === 0) {
        console.error(`[Database] ERROR: Test database has no tables!`);
        throw new Error('E2E test database exists but has no schema - migrations may have failed');
      }
      console.error(`[Database] Test database schema verified`);
    } catch (error) {
      console.error(`[Database] ERROR checking schema:`, error);
      throw error;
    }
  }

  return _db;
}

// Export a proxy that lazily initializes the database on first access
export const db = new Proxy({} as DrizzleDB, {
  get(_target, prop) {
    const database = initializeDatabase();
    return (database as any)[prop];
  },
}) as DrizzleDB;

export type DB = typeof db;
