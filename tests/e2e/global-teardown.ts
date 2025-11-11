import { unlink } from 'fs/promises';
import { resolve } from 'path';

/**
 * Global teardown for Playwright E2E tests
 *
 * This runs once after all tests to clean up the test database
 */
export default async function globalTeardown() {
  console.log('\n🧹 Global Teardown: Cleaning up E2E test database...\n');

  const dbPath = resolve(__dirname, '../../packages/api/test-e2e.db');

  try {
    await unlink(dbPath);
    console.log('✅ Global Teardown: E2E database deleted\n');
  } catch (error) {
    // Database might not exist, that's okay
    console.warn('⚠️  Could not delete E2E database file:', error);
  }
}
