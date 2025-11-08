# Research & Technology Decisions

**Feature**: SkillSwap Platform
**Date**: 2025-11-08
**Phase**: 0 (Pre-Implementation Research)

This document resolves the 10 technical unknowns identified in [plan.md](plan.md) and establishes best practices for the chosen technology stack.

---

## Research Topic 1: Skill Taxonomy Data Source

**Context**: FR-013 requires 10-15 top-level categories and ~100 pre-seeded skills from industry standards (LinkedIn Skills, O*NET classifications).

### Options Evaluated

**Option A: LinkedIn Skills API**
- **Pros**: Industry-standard, constantly updated, widely recognized
- **Cons**: No public API, requires LinkedIn Partnership (costly), rate limits
- **Feasibility**: ❌ Not viable (API access restricted)

**Option B: O*NET Database**
- **Pros**: Free, comprehensive (35k skills), US Department of Labor maintained, CC BY 4.0 license
- **Cons**: US-centric, requires data transformation, large dataset to filter
- **Feasibility**: ✅ Viable
- **URL**: https://www.onetcenter.org/database.html

**Option C: Manual Curation from Multiple Sources**
- **Pros**: Full control, can curate for EU market (FR/UK), lightweight
- **Cons**: Initial effort, maintenance burden, may miss emerging skills
- **Feasibility**: ✅ Viable

**Option D: European Skills/Competences Classification (ESCO)**
- **Pros**: EU-focused, multilingual (FR/EN), European Commission maintained, free API
- **Cons**: Bureaucratic taxonomy, may be overly detailed for MVP
- **Feasibility**: ✅ Highly viable for FR/UK market
- **URL**: https://esco.ec.europa.eu/en/use-esco/download

### Decision

**Use ESCO (European Skills/Competences, Qualifications and Occupations) for initial taxonomy seeding**

**Rationale**:
1. **Geographic Fit**: Designed for European market (FR/UK scope)
2. **Multilingual**: Native FR/EN support (matches FR-003 i18n requirement)
3. **Free & Open**: No licensing costs, API available
4. **Maintained**: European Commission updates regularly
5. **Quality**: Standardized across EU, industry-recognized

**Implementation Plan**:
- Download ESCO CSV dump (2.5k skills in hierarchical structure)
- Filter to 10-15 top-level categories (Engineering, Design, Marketing, Business, etc.)
- Select ~100 most relevant skills for startup/SME context
- Map ESCO skill names to simpler English/French labels
- Store in database seed file (`packages/database/seeds/skills.ts`)
- Allow user-proposed skills (FR-014) to grow taxonomy organically

**Fallback**: If ESCO data is too complex, use manual curation from O*NET + LinkedIn job postings

**ADR**: Create ADR-005 during implementation phase

---

## Research Topic 2: RBAC Library for Permission Enforcement

**Context**: FR-011 requires granular permission checks on all operations. FR-006 to FR-012 define N:N User-Role-Permission model with company context.

### Options Evaluated

**Option A: CASL (Isomorphic Authorization)**
- **TypeScript Support**: ✅ Excellent (first-class)
- **Complexity**: Low (define abilities declaratively)
- **Flexibility**: High (field-level permissions, conditions)
- **Bundle Size**: ~10KB minified
- **Adoption**: 3.5k GitHub stars, widely used in React/Node.js
- **Pros**: Isomorphic (same rules on frontend/backend), intuitive API
- **Cons**: Learning curve for advanced features

**Option B: Casbin**
- **TypeScript Support**: ⚠️ Adequate (bindings available, not idiomatic)
- **Complexity**: Medium (PERM/ACL model files)
- **Flexibility**: Very high (policy-based, supports RBAC/ABAC)
- **Adoption**: 15k GitHub stars, polyglot (Go/Java/Node.js)
- **Pros**: Powerful policy engine, proven at scale
- **Cons**: Config files separate from code, less TypeScript-friendly

**Option C: Custom Implementation**
- **TypeScript Support**: ✅ Native
- **Complexity**: Low for MVP (simple role-permission checks)
- **Flexibility**: Medium (grows with requirements)
- **Pros**: Zero dependencies, full control, simple for MVP
- **Cons**: Reinventing wheel, may miss edge cases

### Decision

**Start with Custom RBAC implementation for MVP, migrate to CASL if complexity grows**

**Rationale**:
1. **Simplicity (YAGNI)**: MVP needs simple role-permission checks, not complex policies
2. **Type Safety**: Custom TypeScript code is fully typed without learning library DSL
3. **Zero Dependencies**: Aligns with Constitution Principle V (simplicity)
4. **Migration Path**: If RBAC complexity grows (P3+ features), CASL provides clear upgrade path
5. **Performance**: No abstraction overhead for MVP scale (100 users)

**Implementation Pattern**:

```typescript
// packages/domain/src/use-cases/CheckPermission.ts
interface PermissionCheck {
  userId: string;
  permission: string; // e.g., "create_skill_need"
  companyId?: string; // for company-scoped permissions
}

// Middleware: packages/api/src/middleware/permissions.ts
export const requirePermission = (permission: string) => async (c, next) => {
  const user = c.get('user');
  const hasPermission = await checkUserPermission(user.id, permission, companyId);
  if (!hasPermission) throw new ForbiddenError();
  await next();
};
```

**Database Schema**:
- `permissions` table: `{ id, name, resource, action, description }`
- `roles` table: `{ id, name, company_id, scope }`
- `role_permissions` junction: `{ role_id, permission_id }`
- `user_roles` junction: `{ user_id, role_id, company_id }`

**Evaluation Trigger**: If permission rules exceed 20 distinct permissions OR introduce attribute-based access control (ABAC), migrate to CASL

**ADR**: Create ADR-003 during implementation phase

---

## Research Topic 3: Password Breach Detection

**Context**: FR-040 requires checking passwords against known breached password databases.

### Options Evaluated

**Option A: Have I Been Pwned (HIBP) API**
- **Privacy**: ✅ Excellent (k-anonymity protocol, only first 5 chars of SHA-1 sent)
- **Data Quality**: 850M+ breached passwords (updated frequently)
- **API**: Free for reasonable use, rate limit 1 req/1.5s
- **Integration**: Simple REST API
- **Pros**: Industry standard, Troy Hunt-maintained, privacy-preserving
- **Cons**: External dependency, rate limits

**Option B: Local Breached Password Database**
- **Privacy**: ✅ Perfect (no external calls)
- **Data Quality**: Depends on dataset (e.g., 10M from SecLists)
- **Storage**: ~200MB compressed (full HIBP dataset ~12GB)
- **Pros**: No external dependency, no rate limits
- **Cons**: Large storage, requires updates, out-of-date quickly

**Option C: Password Strength Rules (No Breach Check)**
- **Privacy**: ✅ Perfect
- **Data Quality**: ❌ Doesn't catch breached passwords
- **Pros**: Zero dependencies
- **Cons**: Fails FR-040 requirement

### Decision

**Use Have I Been Pwned (HIBP) k-Anonymity API**

**Rationale**:
1. **Requirement Compliance**: FR-040 explicitly requires breach detection
2. **Privacy**: k-anonymity ensures no full password/hash sent over network
3. **Maintenance-Free**: Troy Hunt maintains dataset, no manual updates
4. **Proven**: Used by 1Password, Dropbox, government agencies
5. **Cost**: Free for non-commercial/reasonable use (MVP qualifies)

**Implementation**:

```typescript
// packages/api/src/adapters/external/HIBPPasswordChecker.ts
import crypto from 'crypto';

async function isPasswordBreached(password: string): Promise<boolean> {
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.substring(0, 5);
  const suffix = sha1.substring(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const hashes = await response.text();

  return hashes.includes(suffix); // If found, password is breached
}
```

**Rate Limiting**: Cache results per session (if user tries same password multiple times)

**Fallback**: If HIBP API is down, log warning and allow registration (degrade gracefully)

**ADR**: Create ADR-004 during implementation phase

---

## Research Topic 4: Rate Limiting Strategy

**Context**: FR-045 requires rate limiting: 100 read/20 write per min per user, 300 per min per IP.

### Options Evaluated

**Option A: Hono Middleware (In-Memory)**
- **Complexity**: Low (simple Map-based counter)
- **Scalability**: Single-server only (no shared state)
- **Persistence**: None (resets on restart)
- **Pros**: Zero external dependencies, fast
- **Cons**: Not distributed, no persistence

**Option B: Redis-Backed Rate Limiter**
- **Complexity**: Medium (requires Redis)
- **Scalability**: High (distributed state)
- **Persistence**: Optional (can persist to disk)
- **Pros**: Production-ready, distributed, atomic operations
- **Cons**: External dependency (Redis), operational complexity

**Option C: Upstash Rate Limit (Serverless)**
- **Complexity**: Low (managed service)
- **Scalability**: High (serverless)
- **Persistence**: Built-in
- **Pros**: Zero-config, global edge deployment
- **Cons**: Vendor lock-in, cost (free tier: 10k requests/day)

### Decision

**Use In-Memory Hono Middleware for MVP, migrate to Redis for production**

**Rationale**:
1. **YAGNI**: MVP runs single server (no distributed state needed)
2. **Simplicity**: No external dependencies for MVP
3. **Performance**: In-memory is fastest for single-server
4. **Migration Path**: Clear upgrade to Redis when scaling horizontally
5. **Cost**: Free for MVP

**Implementation**:

```typescript
// packages/api/src/middleware/rate-limit.ts
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const store = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = (config: RateLimitConfig) => async (c, next) => {
  const key = c.get('user')?.id || c.req.header('x-forwarded-for') || 'anonymous';
  const now = Date.now();

  let record = store.get(key);
  if (!record || record.resetAt < now) {
    record = { count: 0, resetAt: now + config.windowMs };
    store.set(key, record);
  }

  if (record.count >= config.maxRequests) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }

  record.count++;
  await next();
};
```

**Usage**:
```typescript
app.get('/api/skills/*', rateLimit({ windowMs: 60000, maxRequests: 100 })); // 100/min reads
app.post('/api/*', rateLimit({ windowMs: 60000, maxRequests: 20 })); // 20/min writes
```

**Production Migration**: Replace `store` with Redis client (same interface)

---

## Research Topic 5: Session Management with Lucia Auth

**Context**: FR-041 requires session timeouts (24h talent, 4h talent_manager). Lucia Auth supports multiple session storage backends.

### Options Evaluated

**Option A: Database Sessions** (SQLite/PostgreSQL)
- **Persistence**: ✅ Full (survives server restart)
- **Scalability**: Medium (database I/O overhead)
- **Complexity**: Low (reuse existing database)
- **Pros**: No additional infrastructure, ACID guarantees
- **Cons**: Database load increases with sessions

**Option B: In-Memory Sessions**
- **Persistence**: ❌ Lost on restart
- **Scalability**: High (fastest)
- **Complexity**: Very low
- **Pros**: Zero latency, simple
- **Cons**: Not production-ready, sessions lost on deploy

**Option C: Redis Sessions**
- **Persistence**: ✅ Configurable (RDB/AOF)
- **Scalability**: Very high (sub-millisecond latency)
- **Complexity**: Medium (requires Redis)
- **Pros**: Industry standard, fast, distributed
- **Cons**: External dependency

### Decision

**Use Database Sessions (SQLite MVP → PostgreSQL production)**

**Rationale**:
1. **Simplicity**: Reuse existing database (no additional infrastructure)
2. **Persistence**: Sessions survive server restarts (important for 24h sessions)
3. **Consistency**: Session data in same transactional boundary as user data
4. **Migration Path**: PostgreSQL scales well for session load (MVP: 100 users = 100 sessions max)
5. **Monitoring**: Can query session table for analytics (active users, session duration)

**Lucia Auth Configuration**:

```typescript
// packages/database/src/schema/sessions.ts (Drizzle)
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// packages/api/src/adapters/external/LuciaAuthAdapter.ts
import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);
const lucia = new Lucia(adapter, {
  sessionCookie: { expires: false },
  getUserAttributes: (user) => ({ role: user.role }),
});
```

**Session Timeout Implementation**:
- Middleware checks user roles, sets appropriate expiry (24h vs 4h)
- Re-authentication for critical ops (FR-042) checks session age separately

**Cleanup**: Scheduled job to delete expired sessions (run daily)

---

## Research Topic 6: i18next Namespace Organization

**Context**: FR-003 requires French/English support. Best practices for organizing translation files.

### Best Practices Research

**Namespace Strategy** (from i18next documentation + React community):

**Option A: Feature-Based Namespaces**
- Structure: `en/companies.json`, `en/skills.json`, `en/exchanges.json`
- Pros: Clear ownership, easy to find translations for feature
- Cons: May have duplication (e.g., "Save" button in multiple features)

**Option B: Layer-Based Namespaces**
- Structure: `en/common.json` (shared), `en/domain.json` (business terms), `en/errors.json`
- Pros: DRY principle, shared strings reused
- Cons: Large files, harder to find specific translation

**Option C: Hybrid Approach**
- Structure: `common.json` + feature namespaces
- Pros: Best of both (shared + specific)
- Cons: Need to decide common vs. feature boundary

### Decision

**Use Hybrid Approach: `common` + feature-based namespaces**

**Namespace Structure**:

```
packages/frontend/src/i18n/locales/
├── en/
│   ├── common.json        # Buttons, navigation, errors, validation messages
│   ├── auth.json          # Login, registration, password reset
│   ├── companies.json     # Company onboarding, profiles
│   ├── skills.json        # Skill taxonomy, skill mapping, availability
│   ├── exchanges.json     # Skill needs, proposals, approvals, time tracking
│   └── credits.json       # Credit balance, purchases, transactions
└── fr/
    ├── common.json
    ├── auth.json
    ├── companies.json
    ├── skills.json
    ├── exchanges.json
    └── credits.json
```

**Common Namespace** (`common.json`):
- UI elements: "Save", "Cancel", "Delete", "Edit", "Back", "Next"
- Navigation: "Dashboard", "Profile", "Settings", "Logout"
- Validation: "Required field", "Invalid email", "Password too short"
- Errors: "Network error", "Server error", "Not found"
- Dates: "Today", "Yesterday", "Week ago"

**Feature Namespaces**: Business-specific terms
- `skills.json`: "Skill categories", "Propose new skill", "Availability percentage"
- `exchanges.json`: "Skill need", "Propose exchange", "Approve exchange", "Legal review"

**Usage Example**:

```typescript
import { useTranslation } from 'react-i18next';

function SkillForm() {
  const { t } = useTranslation(['skills', 'common']); // Load multiple namespaces

  return (
    <form>
      <label>{t('skills:selectCategory')}</label>
      <button>{t('common:save')}</button>
    </form>
  );
}
```

**Lazy Loading**: Load namespaces on demand (e.g., `exchanges` namespace only when viewing exchanges)

**Tooling**: Use `i18next-scanner` to extract hardcoded strings during development

---

## Research Topic 7: State Machine Pattern for Approval Workflow

**Context**: FR-022 requires 3-step approval workflow: Employee consent → Manager approval → Legal check (NDA signing). Exchange status: proposed → negotiating → approved → active → complete.

### Patterns Evaluated

**Option A: XState (Explicit State Machines)**
- **Complexity**: Medium (learning curve)
- **Visualization**: ✅ Excellent (statechart visualizer)
- **Type Safety**: ✅ Full TypeScript support
- **Pros**: Prevents invalid transitions, auditable, testable
- **Cons**: Library dependency, overkill for simple workflows

**Option B: Enum + Transition Rules (Custom)**
- **Complexity**: Low
- **Visualization**: Manual (draw diagrams)
- **Type Safety**: ✅ TypeScript enums
- **Pros**: Simple, no dependencies, full control
- **Cons**: Manual validation of transitions

**Option C: Database-Driven Workflow Engine**
- **Complexity**: High
- **Pros**: Dynamic workflows, no code changes
- **Cons**: Over-engineered for MVP

### Decision

**Use Enum + Transition Rules (Custom State Machine)**

**Rationale**:
1. **Simplicity**: Workflow is simple and unlikely to change (YAGNI)
2. **Type Safety**: TypeScript enums + validation functions
3. **Zero Dependencies**: Aligns with Constitution Principle V
4. **Testable**: Unit tests for transition validation
5. **Auditable**: `Approval` table logs each step with timestamp

**Implementation**:

```typescript
// packages/shared/src/constants/statuses.ts
export enum ExchangeStatus {
  PROPOSED = 'proposed',
  NEGOTIATING = 'negotiating',
  AWAITING_CONSENT = 'awaiting_consent',
  AWAITING_MANAGER = 'awaiting_manager',
  AWAITING_LEGAL = 'awaiting_legal',
  APPROVED = 'approved',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// packages/domain/src/entities/Exchange.ts
export class Exchange {
  private static transitions: Record<ExchangeStatus, ExchangeStatus[]> = {
    [ExchangeStatus.PROPOSED]: [ExchangeStatus.NEGOTIATING, ExchangeStatus.CANCELLED],
    [ExchangeStatus.NEGOTIATING]: [ExchangeStatus.AWAITING_CONSENT, ExchangeStatus.CANCELLED],
    [ExchangeStatus.AWAITING_CONSENT]: [ExchangeStatus.AWAITING_MANAGER, ExchangeStatus.CANCELLED],
    [ExchangeStatus.AWAITING_MANAGER]: [ExchangeStatus.AWAITING_LEGAL, ExchangeStatus.CANCELLED],
    [ExchangeStatus.AWAITING_LEGAL]: [ExchangeStatus.APPROVED, ExchangeStatus.CANCELLED],
    [ExchangeStatus.APPROVED]: [ExchangeStatus.ACTIVE],
    [ExchangeStatus.ACTIVE]: [ExchangeStatus.COMPLETED],
    [ExchangeStatus.COMPLETED]: [],
    [ExchangeStatus.CANCELLED]: [],
  };

  canTransitionTo(newStatus: ExchangeStatus): boolean {
    return Exchange.transitions[this.status].includes(newStatus);
  }

  transitionTo(newStatus: ExchangeStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new InvalidTransitionError(this.status, newStatus);
    }
    this.status = newStatus;
  }
}
```

**Approval Tracking**:
- Each status change creates an `Approval` record: `{ exchange_id, type, status, approver_id, timestamp }`
- Types: `employee_consent`, `manager_approval`, `legal_check`

**Evaluation Trigger**: If workflows become complex (multiple parallel approvals, conditional paths), migrate to XState

---

## Research Topic 8: Database Indexes for Skill Search Optimization

**Context**: FR-020 requires skill search/filter. SC-018 requires <2 seconds for 90% of queries. MVP scale: 100 employees, ~10 skills each, 10-15 categories.

### Indexing Strategy

**Query Patterns** (derived from FR-020):
1. Search by skill name: `SELECT * FROM user_skills WHERE skill_id = ?`
2. Filter by availability: `SELECT * FROM talent_availability WHERE availability_pct >= ?`
3. Filter by company: `SELECT * FROM users WHERE company_id = ?`
4. Combined search: Skills + availability + anonymization

**Recommended Indexes**:

```sql
-- Primary key indexes (auto-created)
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);

-- Search/filter indexes
CREATE INDEX idx_talent_availability_user_id ON talent_availability(user_id);
CREATE INDEX idx_talent_availability_pct ON talent_availability(availability_pct); -- For >= queries
CREATE INDEX idx_users_company_id ON users(company_id);

-- Composite index for common query (skill + availability)
CREATE INDEX idx_search_skill_availability ON user_skills(skill_id, user_id);

-- Full-text search on skill names (for autocomplete)
-- SQLite: CREATE VIRTUAL TABLE skills_fts USING fts5(name, category);
-- PostgreSQL: CREATE INDEX idx_skills_name_trgm ON skills USING gin(name gin_trgm_ops);
```

**Drizzle ORM Syntax**:

```typescript
// packages/database/src/schema/skills.ts
import { index } from 'drizzle-orm/sqlite-core';

export const userSkills = sqliteTable('user_skills', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  skillId: text('skill_id').notNull(),
}, (table) => ({
  userIdx: index('idx_user_skills_user_id').on(table.userId),
  skillIdx: index('idx_user_skills_skill_id').on(table.skillId),
}));
```

**Performance Testing**:
- Seed database with 100 users × 10 skills = 1000 rows
- Run search queries, measure with `EXPLAIN QUERY PLAN` (SQLite)
- Target: <100ms for skill search queries

**Future Optimization** (if search is slow):
- Materialized view for "available talent" (denormalized search index)
- Elasticsearch integration (if full-text search becomes complex)

---

## Research Topic 9: Profile Anonymization Strategy

**Context**: FR-017 requires anonymized profiles when shown to other companies initially (identity revealed after mutual interest).

### Anonymization Approaches

**Option A: Database-Level Anonymization**
- Store `is_anonymized` flag, return partial data in query
- Pros: Simple, enforced at data layer
- Cons: Requires careful query construction

**Option B: API-Level Anonymization**
- Full data in database, redact in API response
- Pros: Flexible, easy to change rules
- Cons: Risk of accidental data leakage

**Option C: Separate Tables (Anonymized vs. Full Profiles)**
- Two tables: `talent_profiles` (anonymized) and `user_details` (full)
- Pros: Impossible to leak data
- Cons: Data duplication, complexity

### Decision

**Use API-Level Anonymization with TypeScript Types**

**Rationale**:
1. **Type Safety**: Separate TypeScript types prevent accidental leakage
2. **Flexibility**: Easy to adjust anonymization rules per use case
3. **Simplicity**: Single source of truth (database), transformation at API layer
4. **Testable**: Unit tests verify anonymization logic

**Implementation**:

```typescript
// packages/shared/src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  companyId: string;
  // ... full profile
}

export interface AnonymizedUser {
  id: string; // Hashed or pseudonym
  skillCategories: string[]; // e.g., ["Engineering", "Design"]
  experienceLevel: 'junior' | 'mid' | 'senior';
  availabilityPct: number;
  companyIndustry: string; // Industry, not company name
  // NO: name, email, company name
}

// packages/domain/src/use-cases/SearchTalent.ts
function anonymizeUser(user: User): AnonymizedUser {
  return {
    id: hashUserId(user.id), // One-way hash for matching
    skillCategories: extractCategories(user.skills),
    experienceLevel: calculateLevel(user.yearsExperience),
    availabilityPct: user.availabilityPct,
    companyIndustry: user.company.industry,
  };
}
```

**Reveal Workflow**:
1. Company A sees anonymized profile (hashed ID: `anon_xyz`)
2. Company A expresses interest → sends proposal to `anon_xyz`
3. System looks up real user from hash, notifies talent for consent
4. If talent approves → full profile revealed to Company A

**Security**: Use HMAC with secret key for user ID hashing (prevent reverse lookup)

---

## Research Topic 10: Data Retention & Automated Anonymization

**Context**: FR-044 requires 3-year data retention, then automatic anonymization while preserving aggregate statistics.

### Automation Strategies

**Option A: Database Triggers**
- Trigger on date comparison, anonymize on read
- Pros: Automatic, no external scheduler
- Cons: Performance overhead, complex SQL

**Option B: Scheduled Cron Job**
- Daily job finds expired records, anonymizes in batch
- Pros: Simple, predictable, testable
- Cons: Requires scheduler (cron, Kubernetes CronJob)

**Option C: Application-Level Lazy Anonymization**
- Anonymize on access (if `lastActivityAt + 3 years < now`)
- Pros: Zero infrastructure
- Cons: Unpredictable, may miss records

### Decision

**Use Scheduled Job (Node.js Script + System Cron or Cloud Scheduler)**

**Rationale**:
1. **Predictability**: Runs at defined time (e.g., 2 AM daily)
2. **Testability**: Can run script manually for testing
3. **Auditability**: Logs how many records anonymized
4. **Performance**: Batch operation, no per-request overhead
5. **Rollback**: If script fails, records remain intact (idempotent)

**Implementation**:

```typescript
// packages/api/src/jobs/anonymize-expired-users.ts
import { db } from '@es-mono/database';

async function anonymizeExpiredUsers() {
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  const expiredUsers = await db.select()
    .from(users)
    .where(lt(users.lastActivityAt, threeYearsAgo))
    .where(eq(users.isAnonymized, false));

  for (const user of expiredUsers) {
    await db.transaction(async (tx) => {
      // Keep aggregate stats
      await tx.insert(userStats).values({
        industry: user.company.industry,
        skillCount: user.skills.length,
        exchangeCount: user.exchanges.length,
        anonymizedAt: new Date(),
      });

      // Anonymize user
      await tx.update(users).set({
        name: `User_${user.id.slice(0, 8)}`,
        email: `anonymized_${user.id}@deleted.local`,
        isAnonymized: true,
        anonymizedAt: new Date(),
      }).where(eq(users.id, user.id));
    });
  }

  console.log(`Anonymized ${expiredUsers.length} users`);
}
```

**Scheduling**:
- Development: Manual run via `pnpm run job:anonymize`
- Production: System cron (`0 2 * * *` = 2 AM daily) or cloud scheduler

**Aggregate Stats Preserved**:
- `user_stats` table: `{ industry, skill_count, exchange_count, anonymized_at }`
- Network analytics can query stats without PII

**Testing**: Use test database with backdated `lastActivityAt`, verify anonymization

---

## Best Practices Research

### Hono RPC Patterns

**Type-Safe Client/Server Communication**:

```typescript
// packages/api/src/routes/companies.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createCompanySchema } from '@es-mono/shared/validation';

const app = new Hono()
  .get('/', async (c) => {
    const companies = await getCompanies();
    return c.json(companies);
  })
  .post('/', zValidator('json', createCompanySchema), async (c) => {
    const data = c.req.valid('json');
    const company = await createCompany(data);
    return c.json(company, 201);
  });

export type CompaniesAPI = typeof app;
```

```typescript
// packages/frontend/src/lib/api.ts
import { hc } from 'hono/client';
import type { CompaniesAPI } from '@es-mono/api/routes/companies';

const client = hc<CompaniesAPI>('/api/companies');

// Fully type-safe calls
const companies = await client.$get(); // IntelliSense knows return type
const newCompany = await client.$post({ json: { name: 'Acme' } });
```

**Best Practices**:
- Export route types (`export type XyzAPI = typeof app`)
- Use `zValidator` for runtime validation + TypeScript inference
- Group routes by domain (`companies.ts`, `skills.ts`, `exchanges.ts`)

---

### Drizzle ORM Best Practices for Hexagonal Architecture

**Repository Pattern**:

```typescript
// packages/domain/src/ports/repositories/CompanyRepository.ts (Port)
export interface CompanyRepository {
  findById(id: string): Promise<Company | null>;
  create(data: CreateCompanyData): Promise<Company>;
  update(id: string, data: Partial<Company>): Promise<Company>;
}

// packages/database/src/repositories/DrizzleCompanyRepository.ts (Adapter)
export class DrizzleCompanyRepository implements CompanyRepository {
  constructor(private db: DrizzleDB) {}

  async findById(id: string): Promise<Company | null> {
    const row = await this.db.select().from(companies).where(eq(companies.id, id)).get();
    return row ? this.mapToDomain(row) : null;
  }

  private mapToDomain(row: CompanyRow): Company {
    // Map database row to domain entity
    return new Company({ id: row.id, name: row.name, ... });
  }
}
```

**Best Practices**:
- Keep Drizzle queries in repository adapters (not in use cases)
- Map database rows to domain entities (don't leak Drizzle types)
- Use transactions for multi-table operations: `db.transaction(async (tx) => { ... })`

---

### TanStack Router File-Based Routing

**Recommended Structure**:

```
packages/frontend/src/routes/
├── __root.tsx              # Root layout (nav, footer)
├── index.tsx               # Homepage (/)
├── auth/
│   ├── login.tsx           # /auth/login
│   └── register.tsx        # /auth/register
├── companies/
│   ├── index.tsx           # /companies (list)
│   └── $companyId.tsx      # /companies/:companyId (detail)
├── skills/
│   ├── index.tsx           # /skills (skill mapping)
│   └── search.tsx          # /skills/search (talent search)
└── exchanges/
    ├── index.tsx           # /exchanges (list)
    ├── new.tsx             # /exchanges/new (create)
    └── $exchangeId.tsx     # /exchanges/:exchangeId (detail)
```

**Type-Safe Routing**:

```typescript
// Automatic route types from file structure
import { Link, useParams } from '@tanstack/react-router';

function CompanyDetail() {
  const { companyId } = useParams({ from: '/companies/$companyId' }); // Type-safe
  return <div>Company {companyId}</div>;
}

// Type-safe navigation
<Link to="/companies/$companyId" params={{ companyId: '123' }}>View Company</Link>
```

---

### shadcn/ui Customization

**Theme Configuration**:

```typescript
// packages/design-system/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3b82f6', ... },
        secondary: { DEFAULT: '#64748b', ... },
        // shadcn uses CSS variables for theming
      },
    },
  },
};
```

**Custom Components**:

```typescript
// packages/design-system/src/components/domain/SkillSelector.tsx
import { Select } from '../ui/select'; // shadcn component
import { useTranslation } from 'react-i18next';

export function SkillSelector({ category, onChange }) {
  const { t } = useTranslation('skills');
  const skills = useSkillsByCategory(category);

  return (
    <Select onValueChange={onChange}>
      <SelectTrigger>{t('selectSkill')}</SelectTrigger>
      <SelectContent>
        {skills.map(skill => (
          <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

---

### Vitest + Testing Library

**Component Testing Pattern**:

```typescript
// packages/frontend/tests/component/SkillSelector.test.tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { SkillSelector } from '@/components/domain/SkillSelector';

describe('SkillSelector', () => {
  it('should display skills for selected category', async () => {
    const onChange = vi.fn();
    render(<SkillSelector category="Engineering" onChange={onChange} />);

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });
});
```

**Mock i18n**:

```typescript
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
```

---

### Playwright Multi-Language Testing

**Test Structure**:

```typescript
// tests/e2e/exchange-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Exchange Flow', () => {
  test.use({ locale: 'en-US' });

  test('should complete full exchange workflow in English', async ({ page }) => {
    await page.goto('/exchanges/new');
    await expect(page.getByRole('heading', { name: 'Create Exchange' })).toBeVisible();
    // ...
  });

  test.use({ locale: 'fr-FR' });

  test('should complete full exchange workflow in French', async ({ page }) => {
    await page.goto('/exchanges/new');
    await expect(page.getByRole('heading', { name: 'Créer un échange' })).toBeVisible();
    // ...
  });
});
```

**Configuration**:

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'English', use: { locale: 'en-US' } },
    { name: 'French', use: { locale: 'fr-FR' } },
  ],
});
```

---

## Summary of Decisions

| Topic | Decision | Rationale | ADR |
|-------|----------|-----------|-----|
| 1. Skill Taxonomy | ESCO (EU Skills Database) | Multilingual (FR/EN), EU-focused, free | ADR-005 |
| 2. RBAC Library | Custom → CASL if needed | YAGNI, simple for MVP, clear upgrade path | ADR-003 |
| 3. Breach Detection | Have I Been Pwned API | Privacy-preserving, industry standard | ADR-004 |
| 4. Rate Limiting | In-Memory → Redis | Simple for MVP, scales to distributed | - |
| 5. Session Storage | Database (SQLite → PostgreSQL) | Persistent, reuses existing DB | - |
| 6. i18n Namespaces | Hybrid (common + features) | DRY + clarity | - |
| 7. Approval Workflow | Custom State Machine (Enum) | Simple, type-safe, zero deps | - |
| 8. Database Indexes | Composite indexes on skills/availability | <2s search requirement (SC-018) | - |
| 9. Anonymization | API-level with TypeScript types | Type-safe, flexible, testable | - |
| 10. Data Retention | Scheduled job (cron) | Predictable, auditable, testable | - |

---

## Next Steps

1. ✅ **Research Complete**: All 10 unknowns resolved
2. **Phase 1**: Generate `data-model.md` with entity schemas
3. **Phase 1**: Generate API contracts in `contracts/` (OpenAPI specs)
4. **Phase 1**: Generate `quickstart.md` for developer onboarding
5. **Create ADRs**: Document decisions ADR-003, ADR-004, ADR-005 during implementation

**Status**: ✅ Ready for Phase 1 (Design & Contracts)
