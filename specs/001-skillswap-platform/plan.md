# Implementation Plan: SkillSwap Platform

**Branch**: `001-skillswap-platform` | **Date**: 2025-11-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-skillswap-platform/spec.md`

**Note**: This plan follows the hexagonal architecture constraints defined in [docs/architecture.md](../../docs/architecture.md) and adheres to the [ES-Mono Constitution v1.0.2](../../docs/constitution.md).

## Summary

SkillSwap is a talent-sharing platform enabling startups and SMEs to exchange employee expertise using a credit-based marketplace. Companies lend employees for skill-specific missions (e.g., 3 months, 1 day/week), earning credits usable to borrow talent from the network later. The platform features anonymized talent search, multi-step approval workflows (employee consent → manager → legal/NDA), time tracking, and credit management. Built as a monorepo with hexagonal architecture, TypeScript full-stack (Hono API, React frontend), Drizzle ORM (SQLite → PostgreSQL), Lucia auth, i18next (FR/EN), and shadcn/ui components. MVP excludes payment processing (admin manages credits manually), AI matching, and mobile apps.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20.x LTS for backend, modern browsers for frontend)
**Primary Dependencies**:
- Backend: Hono (API), Drizzle ORM (database), Lucia (auth), Zod (validation)
- Frontend: React 18+, TanStack Router, i18next, shadcn/ui (Radix UI + Tailwind CSS)
- Build: Turborepo (monorepo orchestration), Vite (frontend bundler), tsup (backend bundler)
- Testing: Vitest (unit/integration), Playwright (E2E), Drizzle Studio (database inspection)

**Storage**: SQLite (MVP development) → PostgreSQL (production scale). Drizzle ORM provides migration path. Schema designed for PostgreSQL compatibility from day 1.

**Testing**:
- Unit: Vitest for domain logic, use cases, utilities
- Integration: Vitest + in-memory SQLite for repository/database tests
- Contract: OpenAPI contracts verified against Hono endpoints
- E2E: Playwright for critical user journeys (FR + EN locales)

**Target Platform**: Web application (responsive, desktop-first for managers, mobile-optimized for talent)

**Performance Goals**:
- Skill search: <2s for 90% of queries (SC-018)
- API CRUD: <500ms p95 latency (Constitution standard)
- Concurrent users: 100 without degradation (SC-019)
- Uptime: 99.5% during business hours 9am-6pm FR/UK time (SC-020)

**Constraints**:
  - **Hexagonal Architecture**: Domain core has zero external dependencies; all infrastructure via ports/adapters
  - **Test-First Development**: Red-Green-Refactor cycle mandatory (Constitution Principle I)
  - **Feature Isolation**: Each user story independently implementable/testable (Constitution Principle II)
  - **Security by Design**: Snyk scans, input validation, auth/authz on all endpoints, audit logging (Constitution Principle III)
  - **Atomic Commits**: Each working feature must be committed atomically with descriptive messages
  - **i18n from Day 1**: All UI strings in i18next namespaces (FR/EN)
  - **Database Abstraction**: All queries through repository interfaces (no raw SQL in use cases)

**Scale/Scope**:
- MVP: 10 companies, 100 employees, 5 missions (6 months target - SC-001, SC-002, SC-004)
- Production: 100+ companies, 1000+ employees, concurrent missions
- Entities: 13 core entities (User, Role, Permission, Company, Skill, Mission, Credit transactions, etc.)
- API Endpoints: ~25-30 (companies, skills, missions, credits, auth)
- Screens: ~15-20 (onboarding, talent search, mission workflow, dashboards, admin)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Test-First Development ✅

- **Status**: PASS
- **Evidence**: Each user story in spec.md has acceptance scenarios that can be converted to tests before implementation
- **Implementation**: Vitest for unit/integration, Playwright for E2E, contract tests for OpenAPI specs

### Principle II: Feature Isolation & Independence ✅

- **Status**: PASS
- **Evidence**: 7 user stories prioritized P1-P3, each delivers standalone value:
  - US1 (Company Onboarding): P1 - Entry point, independent test
  - US2 (Employee Skill Mapping): P1 - Talent pool creation, independent test
  - US3 (Skill Needs & Search): P1 - Matching functionality, independent test
  - US4 (Mission Workflow): P2 - Builds on US1-3, complete mission flow
  - US5 (Credit System): P2 - Enables network flexibility
  - US6 (Mission Tracking): P3 - Enhances active missions
  - US7 (Employee Self-Proposal): P3 - Employee empowerment
- **Dependency Minimization**: US1-3 are foundational but independently testable; US4-7 build incrementally

### Principle III: Security by Design ✅

- **Status**: PASS
- **Security Requirements**:
  - FR-040: Password policy (12+ chars, breach checking via Have I Been Pwned)
  - FR-041: Session timeouts (24h talent, 4h manager)
  - FR-042: Re-authentication for critical operations (manager approval, NDA signing)
  - FR-037: Audit logging for GDPR compliance
  - FR-038: Data export (GDPR right to portability)
  - FR-044: 3-year retention, then anonymization
  - FR-045: Rate limiting (100 req/min reads, 20 req/min writes per user, 300 req/min per IP)
- **Implementation**: Lucia auth, Zod input validation, Snyk scanning, audit log middleware

### Principle IV: Observability & Debugging ✅

- **Status**: PASS
- **Logging**: Structured logging for mission state transitions, credit transactions, approval workflow
- **Health Checks**: `/api/health` endpoint for uptime monitoring
- **Error Handling**: Standardized error responses with actionable messages
- **Metrics**: Credit balance auditing (FR-031), time tracking (FR-032)

### Principle V: Simplicity & YAGNI ✅

- **Status**: PASS with justifications
- **Simplicity Measures**:
  - Monorepo (not microservices) for MVP scale
  - SQLite for development (simple setup), PostgreSQL migration path only when needed
  - No payment gateway (admin manual credit adjustments)
  - No e-signature integration (electronic acceptance confirmation)
  - Email notifications (no real-time chat)
  - Manual search/filter (no AI matching algorithms)
- **Justified Complexity**:
  - **Turborepo monorepo** (4 packages): Justification - Hexagonal architecture requires domain/database/API/frontend separation; shared types reduce duplication; better than polyrepo for small team
  - **Hexagonal architecture** (ports/adapters): Justification - Database swapping requirement (SQLite → PostgreSQL), auth migration (Lucia → Clerk), critical for avoiding vendor lock-in
  - **i18next from day 1**: Justification - FR/UK market from start; adding i18n later breaks all UI strings; upfront cost lower than retrofit

### Quality Standards ✅

- **Code Quality**: TypeScript strict mode, ESLint + Prettier, atomic commits
- **Coverage**: 80% minimum for domain/use-case logic (business rules)
- **Documentation**: OpenAPI contracts, JSDoc for functions, quickstart guide
- **Performance**: <500ms API p95, <2s search (SC-018)

### Post-Phase-1 Constitution Re-Check

*(Completed after design artifacts generated)*

- [x] **Verify repository pattern maintains domain isolation**: ✅ PASS
  - data-model.md defines Drizzle schemas with repository pattern references
  - Hexagonal architecture documented in architecture.md enforces domain/database separation
  - Database package implements repository interfaces from domain ports
  - No direct Drizzle dependencies in domain layer

- [x] **Confirm test structure supports test-first workflow**: ✅ PASS
  - quickstart.md documents comprehensive test commands (unit, integration, E2E)
  - Testing sections: `pnpm test`, `pnpm test:integration`, `pnpm test:e2e`
  - Test coverage target: 80% for business logic (Constitution requirement)
  - Vitest for unit/integration, Playwright for E2E with FR + EN support
  - Test-first development workflow documented in Common Tasks section

- [x] **Validate API contracts match functional requirements**: ✅ PASS
  - users.yaml covers FR-001 (invite registration), FR-005 to FR-012 (RBAC), FR-040 to FR-042 (security)
  - companies.yaml covers company profile management
  - skills.yaml covers FR-013 to FR-020 (skills taxonomy, talent search)
  - missions.yaml covers FR-021 to FR-025 (mission workflow), FR-032 to FR-035 (tracking)
  - credits.yaml covers FR-026 to FR-031 (credit system)
  - All contracts include rate limiting (FR-045), auth requirements, validation schemas

- [x] **Check data model enforces all FR validation rules**: ✅ PASS
  - Users: Password 12+ chars (FR-040), breach checking, session timeouts (FR-041), language preference (FR-003)
  - Companies: Invite code required (FR-001), credit balance can go negative (FR-027), location enum FR/UK (FR-002)
  - Skills: ESCO taxonomy with approval workflow (FR-013, FR-014)
  - TalentAvailability: Anonymization flag (FR-017), availability percentage (FR-016)
  - Mission: Status state machine with 9 statuses, re-auth for critical operations (FR-042)
  - Approval: 3-step workflow (employee_consent, manager_approval, legal_check) (FR-022)
  - NDA: Electronic acceptance without e-signature integration (FR-024)
  - TimeLog: Hours tracking (FR-032), work notes (FR-034)
  - CreditTransaction: Audit trail (FR-031), transaction types (mission/purchase/adjustment)

## Project Structure

### Documentation (this feature)

```
specs/001-skillswap-platform/
├── spec.md              # Feature specification (/speckit.specify output)
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 technology research & decisions
├── data-model.md        # Phase 1 entity schemas & relationships
├── quickstart.md        # Phase 1 developer onboarding guide
├── contracts/           # Phase 1 OpenAPI specifications
│   ├── auth.yaml
│   ├── companies.yaml
│   ├── skills.yaml
│   ├── missions.yaml
│   └── credits.yaml
└── tasks.md             # Phase 2 task list (/speckit.tasks output - NOT yet created)
```

### Source Code (repository root)

```
packages/
├── domain/              # Hexagonal core (zero external dependencies)
│   ├── src/
│   │   ├── entities/       # Business entities (Company, User, Mission, etc.)
│   │   ├── use-cases/      # Business logic (CreateMission, ApproveMission, etc.)
│   │   ├── ports/          # Interface definitions for external adapters
│   │   │   ├── repositories/  # Database port interfaces
│   │   │   └── services/      # External service port interfaces (auth, email)
│   │   └── events/         # Domain events (MissionCreated, etc.)
│   └── tests/           # Unit tests for domain logic
│
├── database/            # Database adapter (implements domain ports)
│   ├── src/
│   │   ├── schema/         # Drizzle ORM schemas (users, companies, missions, etc.)
│   │   ├── repositories/   # Repository implementations (DrizzleUserRepo, etc.)
│   │   └── migrations/     # SQL migrations
│   └── tests/           # Integration tests with in-memory SQLite
│
├── api/                 # HTTP adapter (Hono API server)
│   ├── src/
│   │   ├── adapters/
│   │   │   ├── http/          # Hono routes, controllers
│   │   │   ├── repositories/  # Database adapter wiring
│   │   │   └── external/      # Third-party adapters (Lucia auth, email)
│   │   ├── middleware/        # Auth, validation, rate limiting, logging
│   │   ├── config/            # Dependency injection container
│   │   └── index.ts           # Server setup, RPC exports
│   └── tests/
│       ├── contract/       # OpenAPI contract validation
│       └── integration/    # API endpoint integration tests
│
├── frontend/            # React web application
│   ├── src/
│   │   ├── features/       # Feature-based modules (companies, skills, missions, credits)
│   │   ├── routes/         # TanStack Router routes
│   │   ├── lib/            # API client (Hono RPC), utils
│   │   ├── i18n/           # i18next translations (fr.json, en.json)
│   │   └── App.tsx
│   └── tests/
│       └── e2e/            # Playwright E2E tests
│
├── design-system/       # Shared UI component library
│   └── src/
│       └── components/     # shadcn/ui components (Button, Input, Modal, etc.)
│
└── shared/              # Cross-cutting utilities
    └── src/
        ├── types/          # Shared type definitions
        ├── validation/     # Zod schemas for API contracts
        └── constants/      # Error codes, status enums
```

**Structure Decision**: Monorepo with hexagonal architecture to support database/auth abstraction while maintaining strict domain isolation. Domain package has zero npm dependencies. Database and API packages adapt domain ports to concrete implementations (Drizzle, Hono, Lucia). Frontend consumes type-safe API via Hono RPC. Design-system package enables UI consistency. Turborepo orchestrates builds and tests across packages.

## Complexity Tracking

> **Violations requiring justification per Constitution Principle V**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **4+ packages** (6 total: domain, database, api, frontend, design-system, shared) | Hexagonal architecture mandates domain/database/api separation. Frontend is distinct delivery mechanism. Design-system enables shadcn/ui reuse. Shared types reduce duplication. | Merging packages would couple domain to infrastructure (Drizzle, Hono), violating hexagonal constraints and making database/auth swapping impossible. |
| **Repository pattern** (ports/adapters for database) | Required for database abstraction (SQLite → PostgreSQL migration). Domain use cases depend on repository interfaces, not Drizzle directly. | Direct Drizzle usage in use cases would lock us to ORM, preventing swap to Prisma/TypeORM later. Hexagonal architecture explicitly requires this abstraction. |
| **i18next from day 1** (before MVP validation) | FR/UK market from launch (FR-003). Retrofitting i18n breaks all UI strings, component APIs, and validation messages. | Adding i18n post-MVP requires touching every component, API response, and validation error—weeks of refactor vs. hours upfront. Market requirement, not speculation. |

**Summary**: All complexity is driven by explicit requirements (hexagonal architecture for database swapping, i18n for FR/UK market) or Constitution principles (test isolation, feature independence). No speculative abstractions.

## Phase 0: Research & Technology Decisions

### Research Topics

1. **Hexagonal Architecture in TypeScript Monorepo**
   - Research best practices for dependency injection in TypeScript (tsyringe, awilix, or manual DI container)
   - Repository pattern implementation with Drizzle ORM
   - Domain event handling without coupling to infrastructure

2. **Authentication & Authorization**
   - Lucia auth session management for Hono
   - RBAC implementation patterns (user, role, permission entities)
   - Re-authentication for sensitive operations (FR-042)
   - Password breach checking integration (Have I Been Pwned API)

3. **Database Migration Strategy**
   - Drizzle ORM schema design for PostgreSQL compatibility
   - SQLite-specific features to avoid for clean migration
   - Seeding strategy for system roles, permissions, skills taxonomy

4. **i18n Best Practices**
   - i18next namespace organization (common, skills, missions, credits, etc.)
   - Locale switching without page reload
   - Number/date formatting for FR/UK locales
   - Translation extraction workflow from codebase

5. **Testing Strategy**
   - Contract testing for OpenAPI specs with Hono endpoints
   - In-memory SQLite for fast repository integration tests
   - Playwright for E2E mission workflows (FR + EN)
   - Mock strategies for external services (email, breach checker)

6. **Skills Taxonomy Sourcing**
   - ESCO (European Skills/Competences classification) vs. O*NET vs. LinkedIn Skills
   - 10-15 top-level categories, ~100 pre-seeded skills (FR-013)
   - User-proposed skills approval workflow

7. **Credit Calculation Logic**
   - Salary-based baseline algorithm (FR-028)
   - Negotiation counter-proposal workflow (FR-023, FR-029)
   - Negative balance handling, grace period implementation

**Output**: research.md documenting decisions with rationale and alternatives considered

## Phase 1: Design & Contracts

### Data Model (data-model.md)

**Entities to Define** (13 core entities from spec):

1. **Core Identity & Access**
   - User (or Account): Person with roles, company, skills
   - Role: Permission set (system or company-specific)
   - Permission: Granular capability (view_talent_pool, create_skill_need, etc.)
   - UserRole: Junction table for N:N User-Role-Company relationship

2. **Business Entities**
   - Company: Organization with credit balance, invite code
   - Skill: Hierarchical taxonomy (category, name, description)
   - UserSkill: Junction with proficiency level, years experience
   - TalentAvailability: User's offer to work on missions (%, anonymization status)
   - SkillNeed: Company's request for expertise (duration, time commitment)

3. **Mission & Transactions**
   - Mission: Talent lending arrangement with approval workflow, status state machine
   - Approval: Workflow step record (employee_consent, manager_approval, legal_check)
   - NDA: Legal agreement with electronic acceptance (no e-signature integration)
   - CreditTransaction: Credit movement record (mission/adjustment, timestamp, parties)
   - TimeLog: Hours worked tracking for active missions

**For Each Entity**:
- Field definitions with types, constraints, defaults
- Validation rules (FR constraints: password 12+ chars, session timeouts, rate limits, etc.)
- Relationships (1:1, 1:N, N:N with junction tables)
- State machines (Mission status: proposed → negotiating → awaiting_consent → awaiting_manager → awaiting_legal → approved → active → completed/cancelled)
- Indexes for performance (skill search, talent pool filtering, transaction history)

### API Contracts (contracts/ directory)

**OpenAPI 3.0 Specifications**:

1. **auth.yaml**
   - POST /auth/register (invite code required, FR-001)
   - POST /auth/login (session creation)
   - POST /auth/logout (session termination)
   - POST /auth/reauth (critical operations, FR-042)
   - GET /auth/session (current user info)

2. **companies.yaml**
   - POST /companies (admin: generate invite code)
   - GET /companies/{id} (company profile)
   - PATCH /companies/{id} (update industry, size, location)
   - GET /companies/{id}/members (list employees)

3. **skills.yaml**
   - GET /skills (taxonomy with categories, filters, search)
   - POST /skills (user-proposed skills for approval, FR-014)
   - GET /users/{userId}/skills (user skill profile)
   - POST /users/{userId}/skills (add skill with proficiency, FR-015)
   - DELETE /users/{userId}/skills/{skillId} (remove skill)
   - GET /talent/search (anonymized talent pool, FR-017, FR-020)
   - PUT /users/{userId}/availability (set %, active period, FR-016)

4. **missions.yaml**
   - GET /skill-needs (list open needs)
   - POST /skill-needs (talent_manager creates need, FR-018)
   - GET /missions (list missions for company)
   - POST /missions (propose mission, FR-021)
   - PUT /missions/{id}/negotiate (counter-proposal, FR-023)
   - POST /missions/{id}/approvals (submit approval decision, FR-022)
   - POST /missions/{id}/cancel (before consent, FR-025)
   - PUT /missions/{id}/complete (mark finished, FR-035)
   - GET /missions/{id}/time-logs (view hours)
   - POST /missions/{id}/time-logs (log time, FR-032)

5. **credits.yaml**
   - GET /companies/{id}/credits (balance, recent transactions, FR-026)
   - GET /companies/{id}/credits/transactions (transaction history, FR-031, with filters)
   - POST /companies/{id}/credits/adjust (admin manual credit addition, FR-030)
   - GET /credit-packages (predefined packages for display, no actual purchase)

**For Each Endpoint**:
- Request/response schemas with Zod validation
- Authentication requirements (bearerAuth)
- Authorization rules (role-based permissions)
- Error responses (400, 401, 403, 404, 429 with rate limiting headers)
- Rate limiting constraints (FR-045: 100 reads/min, 20 writes/min per user)

### Quickstart Guide (quickstart.md)

**Sections**:

1. **Prerequisites**: Node.js 20.x, pnpm, SQLite CLI
2. **Setup**: Clone, `pnpm install`, `pnpm db:migrate`, `pnpm db:seed`
3. **Development**: `pnpm dev` (starts all packages via Turborepo)
4. **First-Time Walkthrough**:
   - Create first company (admin generates invite)
   - Employee joins via invite link
   - Employee adds skills (select from taxonomy)
   - Employee sets availability (20%, anonymized)
   - HR manager creates skill need (regulatory compliance, 3 months, 1 day/week)
   - HR manager searches talent pool (anonymized profiles)
   - HR manager proposes mission (Employee Y for 30 credits)
   - Approval workflow: employee consent → manager approval → legal (NDA electronic acceptance)
   - Mission activated, credits transferred
   - Employee logs time weekly
   - Mission completed after 3 months
5. **Testing**: `pnpm test` (unit), `pnpm test:integration`, `pnpm test:e2e`
6. **Database**: `pnpm db:studio` (Drizzle Studio), `pnpm db:seed` (reset)
7. **i18n**: Switch language via UI, add translations to `frontend/src/i18n/locales/{fr,en}`

### Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh claude` to update `.claude/agent-context.md`:
- Add TypeScript, Hono, Drizzle ORM, Lucia, React, TanStack Router, i18next, shadcn/ui
- Add hexagonal architecture patterns (domain/ports/adapters)
- Add Turborepo monorepo structure
- Preserve manual technology additions between markers

## Phase 2: Task Generation

*(Not executed by /speckit.plan - this is the /speckit.tasks command)*

Tasks will be organized by user story (US1-US7) with dependencies:

**US1 (P1): Company Onboarding**
- Setup Turborepo monorepo with 6 packages
- Configure TypeScript strict mode, ESLint, Prettier
- Setup Drizzle ORM with SQLite, create companies schema
- Implement Lucia auth with invite-only registration
- Create company profile API endpoints (OpenAPI contract)
- Build company onboarding UI (React + shadcn/ui)
- E2E test: Complete registration via invite link

**US2 (P1): Employee Skill Mapping**
- Create skills taxonomy schema (categories, skills, user_skills)
- Seed database with 10-15 categories, ~100 skills (ESCO-based)
- Implement user skills API (add, remove, proficiency levels)
- Implement availability API (%, anonymization status)
- Build skill survey UI with autocomplete search
- Build availability settings UI
- E2E test: Employee completes skill profile

**US3 (P1): Skill Needs & Talent Search**
- Create skill_needs schema with status state machine
- Implement skill need creation API (talent_manager role)
- Implement talent pool search API (anonymized profiles, filters)
- Build skill need creation UI
- Build talent search UI with filters (skill, availability, experience)
- E2E test: Manager posts need, searches talent, views anonymized profiles

**US4 (P2): Mission Workflow**
- Create missions, approvals, ndas schemas
- Implement mission state machine (9 statuses)
- Implement mission proposal API (negotiation workflow)
- Implement approval API (employee_consent, manager_approval, legal_check)
- Implement re-authentication middleware (FR-042)
- Implement NDA electronic acceptance workflow (sequential, no e-signature)
- Build mission proposal UI
- Build approval workflow UI (inbox, notifications)
- Build NDA review/acceptance UI
- E2E test: Complete mission flow from proposal to activation

**US5 (P2): Credit System**
- Create credit_transactions schema
- Implement credit tracking API (balance, transaction history)
- Implement admin credit adjustment API (manual add/subtract)
- Implement credit calculation logic (salary baseline, negotiation)
- Build credit dashboard UI (balance, transactions, filters)
- Build admin credit adjustment UI
- E2E test: Company goes negative, admin adds credits, view transaction history

**US6 (P3): Mission Tracking**
- Create time_logs schema
- Implement time logging API (hours, date, notes)
- Implement progress notifications (milestone triggers)
- Build time logging UI
- Build mission dashboard UI (active missions, progress, notes)
- E2E test: Log hours, view progress, complete mission

**US7 (P3): Employee Self-Proposal**
- Implement employee mission proposal API (requires manager approval)
- Build opportunity marketplace UI for employees
- Build manager review UI for employee self-proposals
- E2E test: Employee proposes self, manager approves, mission created

**Cross-Cutting**:
- i18n setup: Configure i18next with FR/EN namespaces
- Translations: Extract all UI strings, translate to French
- Security: Integrate Snyk scanning, password breach checking
- Rate limiting: Implement middleware (FR-045)
- Audit logging: Implement for sensitive operations (FR-037)
- GDPR: Implement data export, 3-year retention + anonymization (FR-038, FR-044)

## Success Validation

### Pre-Implementation (Phase 1 Complete)

- [x] ✅ All NEEDS CLARIFICATION resolved in Technical Context
- [x] ✅ Constitution gates passed (re-checked post-design - see Post-Phase-1 Constitution Re-Check above)
- [x] ✅ data-model.md defines all 13 entities with validation rules (45KB, 1081 lines)
- [x] ✅ contracts/ contains 5 OpenAPI specs covering all FR endpoints (users.yaml, companies.yaml, skills.yaml, missions.yaml, credits.yaml)
- [x] ✅ quickstart.md provides complete setup-to-first-mission walkthrough (652 lines, comprehensive)
- [x] ✅ Agent context updated with new technologies (TypeScript 5.x, SQLite → PostgreSQL, all dependencies propagated to CLAUDE.md)

### Post-Implementation (After /speckit.implement)

- [ ] All 23 success criteria (SC-001 to SC-023) validated
- [ ] All 45 functional requirements (FR-001 to FR-045) implemented
- [ ] All 7 user stories have passing E2E tests (FR + EN)
- [ ] Code coverage ≥80% for domain logic
- [ ] Snyk scan passes with no high/critical issues
- [ ] Performance goals met (<2s search, <500ms API, 100 concurrent users)
- [ ] i18n: All UI strings translated (FR/EN), <5% translation errors (SC-003)
- [ ] Constitution compliance: Test-first, atomic commits, feature isolation verified

## Next Steps

1. ✅ **Execute Phase 0**: research.md generated (33KB, 946 lines) with technology decisions
2. ✅ **Execute Phase 1**: Design artifacts generated
   - ✅ data-model.md (45KB, 1081 lines) - 13 entities with schemas, relationships, state machines
   - ✅ contracts/ (5 OpenAPI specs: users.yaml, companies.yaml, skills.yaml, missions.yaml, credits.yaml)
   - ✅ quickstart.md (18KB, 652 lines) - Complete setup-to-first-mission walkthrough
3. ✅ **Update Agent Context**: Ran `.specify/scripts/bash/update-agent-context.sh claude` - TypeScript 5.x, SQLite → PostgreSQL propagated to CLAUDE.md
4. ✅ **Re-check Constitution**: Post-Phase-1 constitution check completed - ALL GATES PASSED
5. **Proceed to Task Generation**: Run `/speckit.tasks` to create dependency-ordered task list
6. **Begin Implementation**: Run `/speckit.implement` with test-first workflow

---

**Plan Status**: ✅ PHASE 0 & PHASE 1 COMPLETE - READY FOR TASK GENERATION
**Constitution Compliance**: ✅ ALL GATES PASSED (initial check + post-design re-check)
**Artifacts Generated**:
- ✅ research.md (Phase 0)
- ✅ data-model.md (Phase 1)
- ✅ contracts/ - 5 OpenAPI specs (Phase 1)
- ✅ quickstart.md (Phase 1)

**Next Command**:
1. Run `.specify/scripts/bash/update-agent-context.sh claude` to update agent context
2. Run `/speckit.tasks` to generate dependency-ordered task list
