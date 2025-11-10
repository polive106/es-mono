import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use absolute path to database file in monorepo root (same as db.ts)
const dbPath = process.env.DATABASE_URL || join(__dirname, '../../../local.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

console.log('🚀 Running migrations...');
console.log(`Database path: ${dbPath}`);

migrate(db, { migrationsFolder: './migrations' });

console.log('✅ Migrations complete!');

sqlite.close();
