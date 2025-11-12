# SkillSwap Platform - Quickstart Guide

**Version**: 1.0.0
**Last Updated**: 2025-11-08
**Target Audience**: Developers new to the SkillSwap codebase

This guide helps you set up the SkillSwap platform locally, understand the project structure, and run your first end-to-end mission workflow.

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool        | Version | Purpose                                      |
| ----------- | ------- | -------------------------------------------- |
| **Node.js** | 18+     | Runtime for backend and build tools          |
| **pnpm**    | 8+      | Package manager (workspace support required) |
| **Git**     | 2.x     | Version control                              |

### Installation

**Node.js**: Download from [nodejs.org](https://nodejs.org/) (LTS version recommended)

**pnpm**: Install globally via npm:

```bash
npm install -g pnpm
```

Verify installations:

```bash
node --version  # Should be 18.x or higher
pnpm --version  # Should be 8.x or higher
```

---

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/es-mono.git
cd es-mono
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for all packages in the monorepo workspace. First run may take 2-3 minutes.

### 3. Environment Configuration

Create `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with the following values:

```bash
# Database
DATABASE_URL="file:./local.db"  # SQLite for MVP
DB_TYPE="sqlite"                # Use "postgres" for production

# API Server
API_PORT=3000
API_HOST="localhost"
NODE_ENV="development"

# Authentication (Lucia)
SESSION_SECRET="your-secret-key-here-min-32-chars"  # Generate with: openssl rand -base64 32

# Breach Detection (optional in dev)
HIBP_API_KEY=""  # Leave empty for dev; get from https://haveibeenpwned.com/API/Key

# Frontend
VITE_API_URL="http://localhost:3000/api"

# i18n
DEFAULT_LANGUAGE="en"
SUPPORTED_LANGUAGES="en,fr"

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000        # 1 minute
RATE_LIMIT_MAX_READS=100          # FR-045
RATE_LIMIT_MAX_WRITES=20          # FR-045
```

**Security**: Never commit `.env` to version control. Ensure `.gitignore` includes `.env`.

---

## Database Setup

### 4. Initialize Database

The project uses Drizzle ORM with SQLite for MVP. PostgreSQL migration supported for production.

**Generate migrations**:

```bash
pnpm --filter @es-mono/database generate
```

This creates migration files in `packages/database/migrations/` based on schemas in `packages/database/src/schema/`.

**Run migrations**:

```bash
pnpm --filter @es-mono/database migrate
```

**Seed database** (system roles, permissions, skills taxonomy):

```bash
pnpm --filter @es-mono/database seed
```

**Verify database**:

```bash
# SQLite CLI (optional)
sqlite3 packages/database/local.db

sqlite> .tables
# Should show: users, companies, roles, permissions, skills, etc.

sqlite> SELECT COUNT(*) FROM skills;
# Should return ~100 (ESCO skill taxonomy)

sqlite> .quit
```

---

## Development Environment

### 5. Run Development Servers

The monorepo includes scripts to run API and frontend concurrently.

**Start all services**:

```bash
pnpm dev
```

This runs:

- **API Server**: `http://localhost:3000` (Hono REST API)
- **Frontend Dev Server**: `http://localhost:5173` (Vite React app)

**Run services separately** (for debugging):

```bash
# Terminal 1: API server
pnpm --filter @es-mono/api dev

# Terminal 2: Frontend
pnpm --filter @es-mono/frontend dev
```

**Access the application**:

- Frontend: http://localhost:5173
- API: http://localhost:3000/api
- Health Check: http://localhost:3000/api/health

---

## First-Time Walkthrough

Follow these steps to understand the complete mission workflow.

### 6. Create First Company

**Step 1: Generate Invite Code** (manual for MVP, later via admin UI)

```bash
# Using API directly
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme HealthTech",
    "industry": "healthtech",
    "size": "11-50",
    "location": "FR"
  }'

# Response includes inviteCode: "ABC12345"
```

**Step 2: Register First User** (HR Manager)

Open browser to http://localhost:5173/auth/register

- Email: `alice@acme.com`
- Password: `SecurePassword123!` (12+ chars, checked against HIBP)
- Name: `Alice Johnson`
- Company Invite Code: `ABC12345`
- Language: English

**Auto-assigned role**: `talent_manager` (first user in company)

**Step 3: Verify Login**

Navigate to http://localhost:5173/auth/login

- Email: `alice@acme.com`
- Password: `SecurePassword123!`

Session created (24h for talent, 4h for talent_manager per FR-041)

---

### 7. Map Employee Skills

**Step 1: Add Skills to Profile**

Navigate to: http://localhost:5173/profile/skills

1. Click "Add Skill"
2. Select category: **Engineering**
3. Select skill: **JavaScript**
4. Proficiency: **Advanced**
5. Years: **5**
6. Save

Repeat for 2-3 more skills (e.g., React, Node.js)

**Step 2: Set Availability**

Navigate to: http://localhost:5173/profile/availability

- Availability: **20%** (1 day/week)
- Active from: **Today**
- Active until: **6 months from now**
- Available for missions: **Yes**
- Save

Your anonymized profile now appears in the talent pool search.

---

### 8. Create Skill Need

**Step 1: Post Skill Requirement**

Navigate to: http://localhost:5173/skill-needs/new

- Title: `Financial Regulatory Compliance Expert`
- Skill: **Business Analysis > Regulatory Compliance**
- Description: `Need help navigating EU financial regulations for new product launch`
- Duration: **3 months**
- Time commitment: **8 hours/week**
- Create

**Step 2: Search Talent Pool**

Navigate to: http://localhost:5173/skills/search

- Filter by skill: **Regulatory Compliance**
- Min availability: **25%**
- Search

Results show anonymized profiles (FR-017):

- Skill categories: `["Business Analysis", "Legal"]`
- Experience: `Senior`
- Availability: `40%`
- Company industry: `fintech` (not company name)

---

### 9. Propose Talent Lending (Not a Swap!)

**IMPORTANT**: This is NOT a simultaneous employee swap. You're borrowing talent now and paying with credits. The lending company can use those credits later to borrow from anyone.

**Example Scenario**:

- **You** (Acme HealthTech) need regulatory help
- **Bob's Fintech** has Employee Y with regulatory skills
- You propose to borrow Employee Y for 3 months
- Credits: Bob's Fintech +30, Acme HealthTech -30
- Later (next month, next year), Bob's Fintech can use those 30 credits to borrow talent from ANY company in the network

**Step 1: Create Mission Proposal**

From search results, click "Propose Mission" on a matching profile

- Receiving company: **Acme HealthTech** (your company - you're borrowing the talent)
- Talent: **Employee Y from Bob's Fintech** (selected from anonymized ID)
- Duration: **3 months**
- Time commitment: **8 hours/week**
- Credit value: **30 credits** (auto-calculated from salary baseline)
- Submit Proposal

**Credit Impact** (when approved):

- Bob's Fintech (lending company): **+30 credits** 💰
- Acme HealthTech (your company): **-30 credits** 💸

**Mission status**: `proposed`

**Next Steps**: Bob's Fintech receives the proposal for approval

---

### 10. Approval Workflow

**Approval Flow**: Employee consent → Lending company manager → Borrowing company manager → Legal (both sides)

**Step 2: Employee Consent** (Employee Y from Bob's Fintech)

Login as Employee Y (the talent being lent)

Navigate to: http://localhost:5173/missions/inbox

- View mission proposal: "Acme HealthTech wants to borrow you for 3 months"
- Review terms (3 months, 8 hrs/week, 30 credits, work on regulatory compliance)
- Click "Give Consent"
- Add comment (optional): `Excited to help with regulatory work!`
- Submit

**Mission status**: `awaiting_manager` (Bob's Fintech manager)

**Step 3: Lending Company Manager Approval** (Bob's Fintech)

Login as talent_manager for Bob's Fintech (Employee Y's employer)

Navigate to: http://localhost:5173/missions/approvals

- View pending mission: "Acme HealthTech wants to borrow Employee Y"
- Verify:
  - Employee Y is available (not on other missions)
  - This doesn't conflict with our projects
  - We want to earn these credits
- Click "Approve"
- Add comment: `Approved - Employee Y is available. Good opportunity for them to gain experience.`
- Submit

**Mission status**: `awaiting_manager` (Acme HealthTech manager)

**Step 4: Borrowing Company Manager Approval** (Acme HealthTech)

Login as talent_manager for Acme HealthTech (your company)

Navigate to: http://localhost:5173/missions/approvals

- View pending mission: "Employee Y from Bob's Fintech approved by their manager"
- Verify we need this talent and can afford credits (-30)
- Click "Approve"
- Add comment: `Approved - looking forward to working with Employee Y`
- Submit

**Mission status**: `awaiting_legal`

**Step 5: Legal Check (NDA Signing)** - Both Companies

Login as talent_manager or legal role (from either company)

Navigate to: http://localhost:5173/missions/approvals

- View mission requiring legal approval
- **Re-authenticate**: Enter password (FR-042 - critical operation for credit transactions)
- Review NDA template protecting both companies
- Both companies sign NDA (FR-024)
- Submit

**Mission status**: `approved`

**Credit Transaction Created**:

- **Bob's Fintech** (lending company): **+30 credits** 💰
- **Acme HealthTech** (borrowing company): **-30 credits** 💸

**Key Point**: Acme HealthTech's balance may now be negative (e.g., started at 0, now -30). This is allowed (FR-027). They can purchase credits later or earn them by lending their own employees.

---

### 11. Activate Mission

Once all approvals complete, mission moves to `active`:

Navigate to: http://localhost:5173/missions/active

**What Happens Now**:

- **Employee Y** (from Bob's Fintech) starts working at **Acme HealthTech**
- Employee Y spends 8 hours/week helping Acme HealthTech with regulatory compliance
- Employee Y remains on Bob's Fintech payroll (no employment transfer, FR-036)
- Duration: 3 months

**Log Hours Worked** (Employee Y):

Login as Employee Y

Navigate to: http://localhost:5173/missions/{id}/time-logs

1. Click "Log Time"
2. Enter:
   - Hours: **8**
   - Date: Today
   - Notes: `Reviewed EU MiFID II compliance requirements for new product launch`
3. Submit

**Track Progress** (Both Companies):

- View total hours logged against commitment (8 hrs/week × 12 weeks = 96 hours total)
- See milestones (1 month, 2 months markers with auto-notifications)
- Both companies can add progress notes (FR-034)
- Acme HealthTech can track value delivered
- Bob's Fintech can track Employee Y's development

---

### 12. Complete Mission

After 3 months, mark mission complete:

Navigate to: http://localhost:5173/missions/{id}/complete

- Click "Mark Complete"
- Add feedback (optional): `Great collaboration, excellent regulatory insights!`
- Submit

**Mission status**: `completed`

**Credits Settled**: Final credit transaction recorded

---

## Testing

### Run Unit Tests

```bash
# All packages
pnpm test

# Specific package
pnpm --filter @es-mono/domain test
pnpm --filter @es-mono/api test
```

### Run Integration Tests

```bash
# API integration tests (Supertest)
pnpm --filter @es-mono/api test:integration
```

### Run E2E Tests

```bash
# Playwright (critical user journeys in FR + EN)
pnpm test:e2e

# Run specific test
pnpm test:e2e -- tests/e2e/mission-flow.spec.ts

# Run with UI (debug mode)
pnpm test:e2e -- --ui
```

### Test Coverage

```bash
pnpm test:coverage
```

**Target**: 80% coverage for business logic (Constitution requirement)

---

## Project Structure

### Monorepo Overview

```
es-mono/
├── packages/
│   ├── domain/           # Pure business logic (hexagonal core)
│   ├── database/         # Drizzle schemas, migrations, repositories
│   ├── api/              # Hono REST API (hexagonal adapters)
│   ├── frontend/         # React + Vite app
│   ├── design-system/    # shadcn UI components
│   └── shared/           # Types, validation, constants
├── tests/                # E2E tests (Playwright)
├── docs/                 # Architecture, ADRs
├── specs/                # Feature specifications
└── .specify/             # Specify framework (constitution, templates)
```

### Key Files Tour

**Database Schema**:

```
packages/database/src/schema/
├── users.ts              # User, Role, Permission, UserRole (RBAC)
├── companies.ts          # Company
├── skills.ts             # Skill, UserSkill, TalentAvailability
├── missions.ts          # Mission, Approval, NDA, TimeLog
└── credits.ts            # CreditTransaction
```

**API Routes**:

```
packages/api/src/adapters/http/routes/
├── companies.ts          # Company management
├── users.ts              # Auth + user profiles
├── skills.ts             # Skills + talent search
├── missions.ts          # Mission lifecycle
└── credits.ts            # Credit operations
```

**Frontend Features**:

```
packages/frontend/src/features/
├── companies/            # Company onboarding (US1)
├── skills/               # Skill mapping (US2), search (US3)
├── missions/             # Mission workflow (US4), tracking (US6)
└── credits/              # Credit management (US5)
```

**i18n Translations**:

```
packages/frontend/src/i18n/locales/
├── en/
│   ├── common.json       # Shared UI strings
│   ├── skills.json       # Skill-related terms
│   └── missions.json     # Mission workflow terms
└── fr/
    └── ...               # French translations
```

---

## Common Tasks

### Development Workflow

**Important**: This project follows the [ES-Mono Constitution](../../docs/constitution.md). Key development practices:

- **Atomic Commits**: Commit at every step when a new working feature is added
  - Each commit should represent a complete, working increment of functionality
  - All tests must pass before committing
  - Use conventional commit format: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
  - Example: `feat: add user authentication endpoint with tests`

- **Test-First Development**: Write tests before implementation (Red-Green-Refactor)
- **Feature Isolation**: Each user story should be independently testable
- **Security by Design**: Run Snyk scans, validate all inputs, check auth on all endpoints

For full development guidelines, see [docs/constitution.md](../../docs/constitution.md).

### Add New Migration

1. Modify schema in `packages/database/src/schema/*.ts`
2. Generate migration: `pnpm --filter @es-mono/database generate`
3. Review generated SQL: `packages/database/migrations/XXXX_migration.sql`
4. Apply migration: `pnpm --filter @es-mono/database migrate`

### Add New API Endpoint

1. Define contract in `specs/001-skillswap-platform/contracts/*.yaml`
2. Create use case in `packages/domain/src/use-cases/`
3. Implement controller in `packages/api/src/adapters/http/controllers/`
4. Add route in `packages/api/src/adapters/http/routes/`
5. Write tests:
   - Unit test: `packages/domain/tests/use-cases/`
   - Integration test: `packages/api/tests/integration/`

### Add Translation

1. Add key to `packages/frontend/src/i18n/locales/en/{namespace}.json`
2. Add French translation to `fr/{namespace}.json`
3. Use in component: `const { t } = useTranslation('namespace'); t('key')`

### Switch to PostgreSQL

1. Install PostgreSQL locally or use cloud (Supabase, Neon)
2. Update `.env`:
   ```bash
   DATABASE_URL="postgresql://user:pass@localhost:5432/skillswap"
   DB_TYPE="postgres"
   ```
3. Run migrations: `pnpm --filter @es-mono/database migrate`
4. Seed database: `pnpm --filter @es-mono/database seed`

**Drizzle handles dialect differences automatically!**

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000 (API)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173 (Frontend)
lsof -ti:5173 | xargs kill -9
```

### Database Locked (SQLite)

Stop all running processes accessing `local.db`, then restart.

### HIBP Password Check Failing

In development, HIBP API key is optional. To bypass:

- Comment out breach check in `packages/api/src/adapters/external/HIBPPasswordChecker.ts`
- Or set `HIBP_API_KEY` in `.env`

### i18n Missing Translation

If you see raw translation keys (e.g., `skills:selectCategory`):

1. Check `packages/frontend/src/i18n/locales/en/skills.json` has the key
2. Verify namespace loaded in component: `useTranslation(['skills'])`
3. Restart dev server to reload translations

---

## Next Steps

1. **Read Architecture Docs**: [docs/architecture.md](../../../docs/architecture.md)
2. **Review ADRs**: [docs/adr/](../../../docs/adr/)
3. **Explore API Contracts**: [contracts/](contracts/)
4. **Read Data Model**: [data-model.md](data-model.md)
5. **Implement Tasks**: Run `/speckit.tasks` to generate implementation checklist

---

## Additional Resources

- **Hono Documentation**: https://hono.dev/
- **Drizzle ORM**: https://orm.drizzle.team/
- **TanStack Router**: https://tanstack.com/router
- **shadcn/ui**: https://ui.shadcn.com/
- **i18next**: https://www.i18next.com/
- **Playwright**: https://playwright.dev/

---

## Getting Help

- **Documentation Issues**: Check [docs/architecture.md](../../../docs/architecture.md) first
- **Code Questions**: Review ADRs in `docs/adr/` for decision context
- **Bugs**: Check existing tests for expected behavior
- **Stack Overflow**: Tag questions with `skillswap` + relevant tech (hono, drizzle, etc.)

---

**Happy Coding!** 🚀

This quickstart should get you from zero to a running SkillSwap platform with your first mission in ~30 minutes.

For implementation details, see [plan.md](plan.md) and [tasks.md](tasks.md) (generated by `/speckit.tasks`).
