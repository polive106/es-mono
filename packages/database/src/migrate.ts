import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

const sqlite = new Database(process.env.DATABASE_URL || './local.db');
const db = drizzle(sqlite);

console.log('🚀 Running migrations...');

migrate(db, { migrationsFolder: './migrations' });

console.log('✅ Migrations complete!');

sqlite.close();
