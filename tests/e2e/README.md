# E2E Tests

End-to-end tests for the SkillSwap platform using Playwright.

## Overview

E2E tests validate the complete application stack:

- **Frontend** (React + Vite)
- **API** (Hono REST API)
- **Database** (SQLite)

Tests run in a real browser and interact with the application as a user would.

## Prerequisites

1. **Install Chromium browser** (one-time setup):

   ```bash
   pnpm exec playwright install chromium
   ```

2. **Ensure dependencies are installed**:
   ```bash
   pnpm install
   ```

## Running Tests

### Run all E2E tests (headless)

```bash
pnpm test:e2e
```

### Run tests with UI (interactive mode)

```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
pnpm test:e2e:headed
```

### Debug tests (step-by-step)

```bash
pnpm test:e2e:debug
```

### Run specific test file

```bash
cd tests/e2e
playwright test tests/auth/register.spec.ts
```

## Test Database

E2E tests use a **persistent test database** located at:

```
packages/api/test-e2e.db
```

### Database Lifecycle

1. **Before all tests**: Database is created, migrations run, test company seeded
2. **Between tests**: Test users are cleaned up (email like `test-%@%`)
3. **After all tests**: Database is deleted

### Test Data

The database is seeded with:

- **Test Company**: "E2E Test Company"
- **Invite Code**: `E2E12345`

Use this invite code in your registration tests.

## Test Structure

```
tests/e2e/
├── playwright.config.ts       # Playwright configuration
├── helpers/
│   └── test-database.ts       # Database setup utilities
├── tests/
│   └── auth/
│       └── register.spec.ts   # Registration E2E tests
└── README.md                  # This file
```

## Writing Tests

### Example Test

```typescript
import { test, expect } from '@playwright/test';
import {
  setupE2EDatabase,
  type E2EDatabase,
} from '../../helpers/test-database';

let e2eDb: E2EDatabase;

test.beforeAll(async () => {
  e2eDb = await setupE2EDatabase();
});

test.afterAll(async () => {
  await e2eDb.cleanup();
});

test('my test', async ({ page }) => {
  await page.goto('/my-page');
  // Use e2eDb.testCompany.inviteCode in your tests
  await page.fill('input[name="inviteCode"]', e2eDb.testCompany.inviteCode);
  // ... rest of test
});
```

### Best Practices

1. **Use unique emails** per test: `test-${Date.now()}@example.com`
2. **Clean up between tests**: Delete test data in `afterEach` hooks
3. **Use test company invite code**: `e2eDb.testCompany.inviteCode`
4. **Wait for navigation**: Use `page.waitForURL()` after form submissions
5. **Verify database state**: Query database to confirm operations succeeded

## Test Reports

After running tests, view the HTML report:

```bash
cd tests/e2e
playwright show-report playwright-report
```

## Troubleshooting

### Browsers not installed

```bash
pnpm exec playwright install
```

### Port conflicts

If ports 3000 or 5173 are in use, stop other dev servers:

```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5173
```

### Database locked

If you see "database is locked", ensure no other tests are running:

```bash
# Clean up any test databases
rm packages/api/test-e2e.db
```

### Test failures

1. Check screenshots in `test-results/`
2. Run with `--headed` to see browser
3. Use `--debug` to step through tests

## CI/CD

In CI environments:

- Tests run with `workers: 1` (sequential)
- Browsers are installed automatically
- Test results are saved as artifacts
- No dev servers are reused (`reuseExistingServer: false`)

## Architecture

### Why Playwright?

- **Real browser testing**: Tests actual user experience
- **Multi-browser support**: Chrome, Firefox, Safari
- **Auto-wait**: Automatically waits for elements
- **Debugging tools**: Time-travel debugging, screenshots, videos
- **Network interception**: Can mock API calls if needed

### Why persistent database?

- **Separate processes**: Frontend and API run independently
- **Realistic setup**: Mimics production environment
- **Performance**: No need to recreate schema between tests
- **Stability**: Consistent state across test suite

## Coverage

Current E2E test coverage:

- ✅ User Registration
  - Successful registration
  - Email validation
  - Password length validation
  - Invalid invite code
  - Duplicate email
  - Empty form validation

Future coverage (TODO):

- [ ] User Login
- [ ] User Logout
- [ ] Password Change
- [ ] Session Management
- [ ] Profile Edit
- [ ] Skill Management
