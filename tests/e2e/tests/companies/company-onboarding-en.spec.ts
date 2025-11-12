import { test, expect } from '@playwright/test';
import { connectToE2EDatabase, type E2EDatabase } from '../../helpers/test-database';
import { users, companies } from '../../../../packages/database/src/schema';
import { sql } from 'drizzle-orm';

/**
 * E2E Tests for Company Onboarding (English)
 *
 * Tests the complete company onboarding flow:
 * - User registration via invite code
 * - Company profile completion
 * - Company dashboard access
 * - View network companies
 */

let e2eDb: E2EDatabase;

test.beforeAll(async () => {
  e2eDb = await connectToE2EDatabase();
});

test.afterEach(async () => {
  // Clean up test users and companies
  await e2eDb.db.delete(users).where(sql`email LIKE 'test-onboarding-%@%'`);
  await e2eDb.db.delete(companies).where(sql`name LIKE 'Test Onboarding Company%'`);
});

test.afterAll(async () => {
  await e2eDb.cleanup();
});

test.describe('Company Onboarding (EN)', () => {
  test('should complete full company onboarding flow', async ({ page }) => {
    // This test will FAIL because the company onboarding UI doesn't exist yet
    const timestamp = Date.now();
    const testEmail = `test-onboarding-${timestamp}@example.com`;
    const uniquePassword = `E2E_Onboard_${timestamp}_P@ssw0rd!`;

    // Step 1: Register user
    await page.goto('/auth/register');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(uniquePassword);
    await page.getByTestId('name-input').fill('HR Manager');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);
    await page.getByTestId('register-submit').click();

    // Step 2: Should be redirected to company onboarding page
    await page.waitForURL('/companies/onboard');

    // Step 3: Complete company profile
    await expect(page.getByTestId('company-onboarding-form')).toBeVisible();

    // Fill company profile details
    await page.getByTestId('company-name-input').fill(`Test Onboarding Company ${timestamp}`);
    await page.getByTestId('industry-select').selectOption('Technology');
    await page.getByTestId('size-select').selectOption('11-50');
    await page.getByTestId('location-select').selectOption('FR');

    // Submit company profile
    await page.getByTestId('onboarding-submit').click();

    // Step 4: Should be redirected to dashboard
    await page.waitForURL('/dashboard');

    // Step 5: Verify company dashboard is visible
    await expect(page.getByTestId('company-dashboard')).toBeVisible();
    await expect(page.getByText(`Test Onboarding Company ${timestamp}`)).toBeVisible();
    await expect(page.getByTestId('credit-balance')).toContainText('0');

    // Step 6: Verify company was created in database
    const createdCompany = await e2eDb.db.query.companies.findFirst({
      where: sql`name = ${'Test Onboarding Company ' + timestamp}`,
    });

    expect(createdCompany).toBeDefined();
    expect(createdCompany?.industry).toBe('Technology');
    expect(createdCompany?.size).toBe('11-50');
    expect(createdCompany?.location).toBe('FR');
    expect(createdCompany?.creditBalance).toBe(0);
  });

  test('should show validation errors for incomplete company profile', async ({ page }) => {
    // This test will FAIL because the validation UI doesn't exist yet
    const timestamp = Date.now();
    const testEmail = `test-onboarding-${timestamp}@example.com`;
    const uniquePassword = `E2E_Onboard_${timestamp}_P@ssw0rd!`;

    // Register and navigate to onboarding
    await page.goto('/auth/register');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(uniquePassword);
    await page.getByTestId('name-input').fill('HR Manager');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);
    await page.getByTestId('register-submit').click();

    await page.waitForURL('/companies/onboard');

    // Try to submit without filling required fields
    await page.getByTestId('onboarding-submit').click();

    // Should show validation errors
    await expect(page.locator('text=/company name.*required/i')).toBeVisible();
    await expect(page.locator('text=/industry.*required/i')).toBeVisible();
    await expect(page.locator('text=/size.*required/i')).toBeVisible();
  });

  test('should allow viewing company profile after onboarding', async ({ page }) => {
    // This test will FAIL because the company profile view doesn't exist yet
    const timestamp = Date.now();
    const testEmail = `test-onboarding-${timestamp}@example.com`;
    const uniquePassword = `E2E_Onboard_${timestamp}_P@ssw0rd!`;

    // Complete full onboarding
    await page.goto('/auth/register');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(uniquePassword);
    await page.getByTestId('name-input').fill('HR Manager');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);
    await page.getByTestId('register-submit').click();

    await page.waitForURL('/companies/onboard');

    await page.getByTestId('company-name-input').fill(`Test Onboarding Company ${timestamp}`);
    await page.getByTestId('industry-select').selectOption('Healthcare');
    await page.getByTestId('size-select').selectOption('51-200');
    await page.getByTestId('location-select').selectOption('UK');
    await page.getByTestId('onboarding-submit').click();

    await page.waitForURL('/dashboard');

    // Navigate to company profile page
    await page.goto('/companies/profile');

    // Verify company details are displayed
    await expect(page.getByTestId('company-name')).toContainText(
      `Test Onboarding Company ${timestamp}`
    );
    await expect(page.getByTestId('company-industry')).toContainText('Healthcare');
    await expect(page.getByTestId('company-size')).toContainText('51-200');
    await expect(page.getByTestId('company-location')).toContainText('UK');
  });

  test('should display network companies list', async ({ page }) => {
    // This test will FAIL because the network companies list doesn't exist yet
    const timestamp = Date.now();
    const testEmail = `test-onboarding-${timestamp}@example.com`;
    const uniquePassword = `E2E_Onboard_${timestamp}_P@ssw0rd!`;

    // Login as existing user
    await page.goto('/auth/login');

    // First create a user to login with
    await page.goto('/auth/register');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(uniquePassword);
    await page.getByTestId('name-input').fill('Network Viewer');
    await page.getByTestId('invite-code-input').fill(e2eDb.testCompany.inviteCode);
    await page.getByTestId('register-submit').click();

    // Navigate to network companies page
    await page.goto('/companies');

    // Should see list of companies in the network
    await expect(page.getByTestId('companies-list')).toBeVisible();

    // Should see at least the test company
    await expect(page.locator(`text=/${e2eDb.testCompany.name}/i`)).toBeVisible();
  });
});
