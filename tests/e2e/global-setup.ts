import { setupE2EDatabase } from './helpers/test-database';

/**
 * Global setup for Playwright E2E tests
 *
 * This runs once before all tests to:
 * 1. Create the E2E test database
 * 2. Run migrations
 * 3. Seed test data (company with invite code)
 *
 * The database is then used by the API server started by Playwright's webServer config
 */
export default async function globalSetup() {
  console.log('\n🔧 Global Setup: Creating E2E test database...\n');

  // Create and setup the database
  const { dbPath, testCompany } = await setupE2EDatabase();

  console.log('✅ Global Setup: E2E database ready\n');
  console.log(`   Database: ${dbPath}`);
  console.log(`   Test Company: ${testCompany.name} (Invite Code: ${testCompany.inviteCode})\n`);
}
