import { test, expect } from '@playwright/test';
import { connectToE2EDatabase, type E2EDatabase } from '../../helpers/test-database';
import { users } from '../../../../packages/database/src/schema';
import { sql } from 'drizzle-orm';

/**
 * E2E Tests for User Login
 *
 * Tests the complete login flow:
 * - Frontend form validation
 * - API authentication
 * - Session creation
 * - Success/error handling
 * - Navigation to dashboard
 */

let e2eDb: E2EDatabase;

test.beforeAll(async () => {
  // Connect to E2E database (created by global setup)
  e2eDb = await connectToE2EDatabase();
});

test.afterEach(async () => {
  // Clean up test users between tests
  await e2eDb.db.delete(users).where(sql`email LIKE 'test-login-%@%'`);
});

test.afterAll(async () => {
  // Close database connection (cleanup handled by global teardown)
  await e2eDb.cleanup();
});

test.describe('User Login', () => {
  test('should have a login page', async ({ page }) => {
    await page.goto('/auth/login');

    // Check that we're not on a 404 page
    await expect(page.locator('text=/not found/i')).not.toBeVisible();

    // Check for login form elements
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // First, register a user
    const timestamp = Date.now();
    const testEmail = `test-login-${timestamp}@example.com`;
    const testPassword = `E2E_Login_${timestamp}_P@ssw0rd!`;

    // Register the user first
    await page.goto('/auth/register');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(testPassword);
    await page.getByTestId('name-input').fill('Login Test User');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);
    await page.getByTestId('register-submit').click();
    await page.waitForURL(/\/(dashboard|login)/);

    // Now test login
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(testPassword);
    await page.getByTestId('login-submit').click();

    // Should navigate to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const testEmail = `test-login-nonexistent-${Date.now()}@example.com`;
    const testPassword = 'WrongPassword123!';

    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(testPassword);
    await page.getByTestId('login-submit').click();

    // Should show invalid credentials error
    await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for wrong password', async ({ page }) => {
    // First, register a user
    const timestamp = Date.now();
    const testEmail = `test-login-${timestamp}@example.com`;
    const correctPassword = `E2E_Login_${timestamp}_P@ssw0rd!`;
    const wrongPassword = 'WrongPassword123!';

    // Register the user first
    await page.goto('/auth/register');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(correctPassword);
    await page.getByTestId('name-input').fill('Login Test User');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);
    await page.getByTestId('register-submit').click();
    await page.waitForURL(/\/(dashboard|login)/);

    // Try to login with wrong password
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(wrongPassword);
    await page.getByTestId('login-submit').click();

    // Should show invalid credentials error
    await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByTestId('email-input').fill('not-an-email');
    await page.getByTestId('password-input').fill('SomePassword123!');
    await page.getByTestId('login-submit').click();

    // Should show email validation error
    await expect(page.locator('text=/invalid.*email/i')).toBeVisible();
  });

  test('should show all required field errors when submitting empty form', async ({ page }) => {
    await page.goto('/auth/login');

    // Submit without filling anything
    await page.getByTestId('login-submit').click();

    // Should show multiple validation errors
    await expect(page.locator('text=/email.*required/i')).toBeVisible();
    await expect(page.locator('text=/password.*required/i')).toBeVisible();
  });

  test('should show error for empty email only', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill password only
    await page.getByTestId('password-input').fill('SomePassword123!');
    await page.getByTestId('login-submit').click();

    // Should show email required error
    await expect(page.locator('text=/email.*required/i')).toBeVisible();
  });

  test('should show error for empty password only', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill email only
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('login-submit').click();

    // Should show password required error
    await expect(page.locator('text=/password.*required/i')).toBeVisible();
  });

  test('should have link to registration page', async ({ page }) => {
    await page.goto('/auth/login');

    // Check for registration link
    const registerLink = page.locator('a[href="/auth/register"]');
    await expect(registerLink).toBeVisible();

    // Click it and verify navigation
    await registerLink.click();
    await page.waitForURL('/auth/register');
    expect(page.url()).toContain('/auth/register');
  });

  test('should allow login with email case variations', async ({ page }) => {
    // Register a user with lowercase email
    const timestamp = Date.now();
    const testEmail = `test-login-${timestamp}@example.com`;
    const testPassword = `E2E_Login_${timestamp}_P@ssw0rd!`;

    await page.goto('/auth/register');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(testPassword);
    await page.getByTestId('name-input').fill('Login Test User');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);
    await page.getByTestId('register-submit').click();
    await page.waitForURL(/\/(dashboard|login)/);

    // Test login with uppercase email (should still work due to normalization)
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill(testEmail.toUpperCase());
    await page.getByTestId('password-input').fill(testPassword);
    await page.getByTestId('login-submit').click();

    // Should still navigate to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });
});
