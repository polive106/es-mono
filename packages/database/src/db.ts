import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { join } from 'path';

// Use absolute path to database file in monorepo root
// Assumes commands are run from monorepo root (which turborepo does)
const dbPath = process.env.DATABASE_URL || join(process.cwd(), 'local.db');
console.error(`[Database] Connecting to: ${dbPath}`);
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

export type DB = typeof db;
