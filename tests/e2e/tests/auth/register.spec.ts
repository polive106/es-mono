import { test, expect } from '@playwright/test';
import { connectToE2EDatabase, type E2EDatabase } from '../../helpers/test-database';
import { users } from '../../../../packages/database/src/schema';
import { sql } from 'drizzle-orm';

/**
 * E2E Tests for User Registration
 *
 * Tests the complete registration flow:
 * - Frontend form validation
 * - API request/response
 * - Database persistence
 * - Success/error handling
 */

let e2eDb: E2EDatabase;

test.beforeAll(async () => {
  // Connect to E2E database (created by global setup)
  e2eDb = await connectToE2EDatabase();
});

test.afterEach(async () => {
  // Clean up test users between tests
  await e2eDb.db.delete(users).where(sql`email LIKE 'test-%@%'`);
});

test.afterAll(async () => {
  // Close database connection (cleanup handled by global teardown)
  await e2eDb.cleanup();
});

test.describe('User Registration', () => {
  test('should have a registration page', async ({ page }) => {
    await page.goto('/auth/register');

    // Check that we're not on a 404 page
    await expect(page.locator('text=/not found/i')).not.toBeVisible();

    // Check for registration form elements
    await expect(page.getByTestId('register-form')).toBeVisible();
  });

  test('should register a new user successfully', async ({ page }) => {
    // Generate unique email for this test
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    // Use a unique password that won't be in breach databases
    const uniquePassword = `E2E_Test_${timestamp}_P@ssw0rd!`;

    // Navigate to registration page
    await page.goto('/auth/register');

    // Fill out registration form using testIds
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(uniquePassword);
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);

    // Submit form
    await page.getByTestId('register-submit').click();

    // Wait for navigation to success page (dashboard or login)
    await page.waitForURL(/\/(dashboard|login)/);

    // Verify user was created in database
    const createdUser = await e2eDb.db.query.users.findFirst({
      where: sql`email = ${testEmail}`,
    });

    expect(createdUser).toBeDefined();
    expect(createdUser?.email).toBe(testEmail);
    expect(createdUser?.name).toBe('Test User');
    expect(createdUser?.companyId).toBe(e2eDb.testCompany.id);
  });

  test('should show error for invalid email', async ({ page }) => {
    const uniquePassword = `E2E_Test_${Date.now()}_P@ssw0rd!`;
    await page.goto('/auth/register');

    // Fill with invalid email
    await page.getByTestId('email-input').fill('not-an-email');
    await page.getByTestId('password-input').fill(uniquePassword);
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);

    // Try to submit
    await page.getByTestId('register-submit').click();

    // Should show validation error
    await expect(page.locator('text=/invalid.*email/i')).toBeVisible();
  });

  test('should show error for short password', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;

    await page.goto('/auth/register');

    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill('short'); // Too short
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);

    await page.getByTestId('register-submit').click();

    // Should show password length error
    await expect(page.locator('text=/password.*12.*characters/i')).toBeVisible();
  });

  test('should show error for invalid invite code', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const uniquePassword = `E2E_Test_${timestamp}_P@ssw0rd!`;

    await page.goto('/auth/register');

    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(uniquePassword);
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('invite-code-input').fill('INVALID1'); // Invalid code

    await page.getByTestId('register-submit').click();

    // Should show invite code error
    await expect(page.locator('text=/invalid.*invite.*code/i')).toBeVisible();
  });

  test('should show error for duplicate email', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const uniquePassword = `E2E_Test_${timestamp}_P@ssw0rd!`;

    // First registration - should succeed
    await page.goto('/auth/register');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(uniquePassword);
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);
    await page.getByTestId('register-submit').click();
    await page.waitForURL(/\/(dashboard|login)/);

    // Try to register again with same email
    await page.goto('/auth/register');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(uniquePassword);
    await page.getByTestId('name-input').fill('Another User');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);
    await page.getByTestId('register-submit').click();

    // Should show duplicate email error
    await expect(page.locator('text=/email.*already.*registered/i')).toBeVisible();
  });

  test('should show all required field errors when submitting empty form', async ({ page }) => {
    await page.goto('/auth/register');

    // Submit without filling anything
    await page.getByTestId('register-submit').click();

    // Should show multiple validation errors
    await expect(page.locator('text=/email.*required/i')).toBeVisible();
    await expect(page.locator('text=/password.*required/i')).toBeVisible();
    await expect(page.locator('text=/name.*required/i')).toBeVisible();
    await expect(page.locator('text=/invite.*code.*required/i')).toBeVisible();
  });
});
