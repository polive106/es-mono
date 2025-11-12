# Tasks: SkillSwap Platform

**Feature**: SkillSwap Platform
**Input**: Design documents from `/specs/001-skillswap-platform/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test-first development is a Constitution requirement. All tests MUST be written and FAIL before implementation (Red-Green-Refactor cycle).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US7)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize monorepo with hexagonal architecture

- [x] T001 Create Turborepo workspace with 6 packages (domain, database, api, frontend, design-system, shared)
- [x] T002 [P] Initialize TypeScript config with strict mode in packages/shared/tsconfig.json
- [x] T003 [P] Setup ESLint and Prettier configs in root
- [x] T004 [P] Configure Turborepo pipelines in turbo.json
- [x] T005 [P] Setup Vitest config for unit tests in packages/domain/vitest.config.ts
- [x] T006 [P] Setup Playwright config for E2E tests in tests/e2e/playwright.config.ts
- [x] T007 Create package.json scripts for dev, test, build in root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [x] T008 Setup Drizzle ORM config in packages/database/drizzle.config.ts (SQLite MVP, PostgreSQL production)
- [x] T009 [P] Create base schema files structure in packages/database/src/schema/
- [x] T010 [P] Define shared types and enums in packages/shared/src/types/index.ts
- [x] T011 [P] Define validation schemas with Zod in packages/shared/src/validation/
- [x] T012 Create migration generation script in packages/database/package.json
- [x] T013 Create seed script structure in packages/database/seeds/

### Authentication & Authorization Foundation

- [x] T014 [P] Setup custom session management in packages/api/src/auth/sessions.ts (alternative to Lucia)
- [x] T015 [P] Create sessions schema in packages/database/src/schema/sessions.ts
- [x] T016 [P] Implement password hashing utility in packages/shared/src/utils/password.ts
- [x] T017 [P] Integrate HIBP password breach checker in packages/api/src/auth/hibp.ts
- [x] T018 Create auth middleware for Hono in packages/api/src/middleware/auth.ts
- [x] T019 [P] Create rate limiting middleware in packages/api/src/middleware/rateLimit.ts (FR-045)
- [x] T019a Create ADR-003: Custom RBAC vs CASL in docs/adr/003-rbac-implementation.md
- [x] T019b Create ADR-004: HIBP Password Breach Integration in docs/adr/004-hibp-integration.md
- [x] T019c Create scheduled job for 3-year data retention + anonymization (FR-044) in packages/api/src/jobs/anonymize-expired-users.ts

### API Foundation

- [x] T020 Setup Hono app structure in packages/api/src/app.ts and packages/api/src/index.ts
- [x] T021 [P] Create error handling middleware in packages/api/src/middleware/errorHandler.ts
- [x] T022 [P] Create logging middleware in packages/api/src/middleware/logger.ts
- [x] T023 [P] Setup CORS and security headers middleware in packages/api/src/middleware/security.ts
- [x] T024 Create health check endpoint in packages/api/src/app.ts (GET /health)
- [x] T025 Setup Hono RPC type exports in packages/api/src/index.ts (export type AppType)

### Frontend Foundation

- [x] T026 Setup Vite React app in packages/frontend/
- [x] T027 [P] Configure TanStack Router in packages/frontend/src/routes/
- [x] T028 [P] Setup i18next with FR/EN namespaces in packages/frontend/src/i18n/
- [x] T029 [P] Initialize shadcn/ui theme in packages/design-system/
- [x] T030 [P] Create Hono RPC client in packages/frontend/src/lib/api.ts
- [x] T031 Create base layout components in packages/frontend/src/components/layouts/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Company Onboarding & Profile Setup (Priority: P1) 🎯 MVP

**Goal**: HR managers can join the network via invite link and set up company profiles to start participating

**Independent Test**: Create company account via invite, complete profile, view network dashboard

**Entities**: Company, User (registration), Role, Permission, UserRole, Session

**Contracts**: companies.yaml, users.yaml (auth endpoints)

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T032 [P] [US1] Contract test: POST /auth/register validates all fields per OpenAPI spec in packages/api/tests/contract/auth.test.ts
- [ ] T033 [P] [US1] Contract test: POST /companies validates company creation per OpenAPI spec in packages/api/tests/contract/companies.test.ts
- [ ] T034 [P] [US1] Unit test: Company entity validation rules in packages/domain/tests/entities/Company.test.ts
- [ ] T035 [P] [US1] Integration test: User registration flow with invite code in packages/api/tests/integration/auth-registration.test.ts
- [ ] T036 [P] [US1] Integration test: Company profile completion workflow in packages/api/tests/integration/company-onboarding.test.ts
- [ ] T037 [P] [US1] E2E test (FR): Complete registration via invite link in tests/e2e/company-onboarding-fr.spec.ts
- [ ] T038 [P] [US1] E2E test (EN): Complete registration via invite link in tests/e2e/company-onboarding-en.spec.ts

### Database Layer for User Story 1

- [ ] T039 [P] [US1] Define Company schema in packages/database/src/schema/companies.ts
- [ ] T040 [P] [US1] Define User schema in packages/database/src/schema/users.ts
- [ ] T041 [P] [US1] Define Role, Permission, UserRole, RolePermission schemas in packages/database/src/schema/roles.ts
- [ ] T042 [US1] Generate and review migration for Company, User, RBAC tables
- [ ] T043 [P] [US1] Seed system roles (talent, talent_manager) in packages/database/seeds/001-roles.ts
- [ ] T044 [P] [US1] Seed system permissions in packages/database/seeds/002-permissions.ts

### Domain Layer for User Story 1

- [ ] T045 [P] [US1] Create Company entity in packages/domain/src/entities/Company.ts
- [ ] T046 [P] [US1] Create User entity in packages/domain/src/entities/User.ts
- [ ] T047 [P] [US1] Define CompanyRepository port in packages/domain/src/ports/repositories/CompanyRepository.ts
- [ ] T048 [P] [US1] Define UserRepository port in packages/domain/src/ports/repositories/UserRepository.ts
- [ ] T049 [US1] Implement RegisterUser use case in packages/domain/src/use-cases/auth/RegisterUser.ts
- [ ] T050 [US1] Implement CreateCompany use case in packages/domain/src/use-cases/companies/CreateCompany.ts
- [ ] T051 [US1] Implement UpdateCompanyProfile use case in packages/domain/src/use-cases/companies/UpdateCompanyProfile.ts
- [ ] T052 [US1] Implement ValidateInviteCode use case in packages/domain/src/use-cases/companies/ValidateInviteCode.ts

### Repository Adapters for User Story 1

- [ ] T053 [P] [US1] Implement DrizzleCompanyRepository in packages/database/src/repositories/DrizzleCompanyRepository.ts
- [ ] T054 [P] [US1] Implement DrizzleUserRepository in packages/database/src/repositories/DrizzleUserRepository.ts
- [ ] T055 [P] [US1] Write integration tests for CompanyRepository in packages/database/tests/repositories/CompanyRepository.test.ts
- [ ] T056 [P] [US1] Write integration tests for UserRepository in packages/database/tests/repositories/UserRepository.test.ts

### API Layer for User Story 1

- [ ] T057 [P] [US1] Implement POST /auth/register controller in packages/api/src/adapters/http/controllers/AuthController.ts
- [ ] T058 [P] [US1] Implement POST /auth/login controller in packages/api/src/adapters/http/controllers/AuthController.ts
- [ ] T059 [P] [US1] Implement POST /auth/logout controller in packages/api/src/adapters/http/controllers/AuthController.ts
- [ ] T060 [US1] Create auth routes in packages/api/src/adapters/http/routes/auth.ts
- [ ] T061 [P] [US1] Implement POST /companies controller in packages/api/src/adapters/http/controllers/CompaniesController.ts
- [ ] T062 [P] [US1] Implement GET /companies controller (list companies)
- [ ] T063 [P] [US1] Implement GET /companies/:id controller (company profile)
- [ ] T064 [P] [US1] Implement PATCH /companies/:id controller (update profile)
- [ ] T065 [US1] Create companies routes in packages/api/src/adapters/http/routes/companies.ts
- [ ] T066 [US1] Add permission checks for company operations (talent_manager only for create)
- [ ] T066a [US1] Create ADR-001: Turborepo Monorepo Structure in docs/adr/001-turborepo-monorepo.md

### Frontend for User Story 1

- [ ] T067 [P] [US1] Create auth routes structure in packages/frontend/src/routes/auth/
- [ ] T068 [P] [US1] Create registration form component in packages/frontend/src/features/auth/RegistrationForm.tsx
- [ ] T069 [P] [US1] Create login form component in packages/frontend/src/features/auth/LoginForm.tsx
- [ ] T070 [P] [US1] Create company profile form in packages/frontend/src/features/companies/CompanyProfileForm.tsx
- [ ] T071 [US1] Create company onboarding flow page in packages/frontend/src/routes/companies/onboard.tsx
- [ ] T072 [US1] Create company dashboard page in packages/frontend/src/routes/dashboard/index.tsx
- [ ] T073 [P] [US1] Add i18n translations for auth (FR/EN) in packages/frontend/src/i18n/locales/{en,fr}/auth.json
- [ ] T074 [P] [US1] Add i18n translations for companies (FR/EN) in packages/frontend/src/i18n/locales/{en,fr}/companies.json

**Checkpoint**: User Story 1 complete - Companies can onboard and access dashboard

---

## Phase 4: User Story 2 - Employee Skill Mapping & Profile Management (Priority: P1)

**Goal**: Employees document skills and availability so expertise can be matched across the network

**Independent Test**: Employees fill skill survey, set availability, see anonymized profile in marketplace

**Entities**: Skill, UserSkill, TalentAvailability

**Contracts**: skills.yaml (taxonomy, user skills, availability endpoints)

### Tests for User Story 2

- [ ] T075 [P] [US2] Contract test: GET /skills/taxonomy validates response per OpenAPI in packages/api/tests/contract/skills.test.ts
- [ ] T076 [P] [US2] Contract test: POST /users/:id/skills validates skill assignment in packages/api/tests/contract/skills.test.ts
- [ ] T077 [P] [US2] Unit test: Skill entity and taxonomy validation in packages/domain/tests/entities/Skill.test.ts
- [ ] T078 [P] [US2] Integration test: Add skills to user profile in packages/api/tests/integration/user-skills.test.ts
- [ ] T079 [P] [US2] Integration test: Update availability percentage in packages/api/tests/integration/availability.test.ts
- [ ] T080 [P] [US2] E2E test: Complete skill profile survey in tests/e2e/skill-mapping.spec.ts

### Database Layer for User Story 2

- [ ] T081 [P] [US2] Define Skill schema in packages/database/src/schema/skills.ts
- [ ] T082 [P] [US2] Define UserSkill junction schema in packages/database/src/schema/skills.ts
- [ ] T083 [P] [US2] Define TalentAvailability schema in packages/database/src/schema/skills.ts
- [ ] T084 [US2] Generate and review migration for Skills tables
- [ ] T085 [US2] Seed ESCO skill taxonomy (~100 skills, 10-15 categories) in packages/database/seeds/003-skills.ts

### Domain Layer for User Story 2

- [ ] T086 [P] [US2] Create Skill entity in packages/domain/src/entities/Skill.ts
- [ ] T087 [P] [US2] Create UserSkill value object in packages/domain/src/entities/UserSkill.ts
- [ ] T088 [P] [US2] Create TalentAvailability entity in packages/domain/src/entities/TalentAvailability.ts
- [ ] T089 [P] [US2] Define SkillRepository port in packages/domain/src/ports/repositories/SkillRepository.ts
- [ ] T090 [P] [US2] Define UserSkillRepository port in packages/domain/src/ports/repositories/UserSkillRepository.ts
- [ ] T091 [US2] Implement AddSkillToUser use case in packages/domain/src/use-cases/skills/AddSkillToUser.ts
- [ ] T092 [US2] Implement RemoveSkillFromUser use case in packages/domain/src/use-cases/skills/RemoveSkillFromUser.ts
- [ ] T093 [US2] Implement SetAvailability use case in packages/domain/src/use-cases/skills/SetAvailability.ts
- [ ] T094 [US2] Implement ProposeNewSkill use case (FR-014) in packages/domain/src/use-cases/skills/ProposeNewSkill.ts
- [ ] T094a [US2] Create ADR-005: ESCO Skill Taxonomy Selection in docs/adr/005-esco-taxonomy.md

### Repository Adapters for User Story 2

- [ ] T095 [P] [US2] Implement DrizzleSkillRepository in packages/database/src/repositories/DrizzleSkillRepository.ts
- [ ] T096 [P] [US2] Implement DrizzleUserSkillRepository in packages/database/src/repositories/DrizzleUserSkillRepository.ts
- [ ] T097 [P] [US2] Write integration tests for SkillRepository in packages/database/tests/repositories/SkillRepository.test.ts

### API Layer for User Story 2

- [ ] T098 [P] [US2] Implement GET /skills/taxonomy controller in packages/api/src/adapters/http/controllers/SkillsController.ts
- [ ] T099 [P] [US2] Implement POST /skills/taxonomy/propose controller (user-proposed skills)
- [ ] T100 [P] [US2] Implement GET /users/:userId/skills controller (user skill profile)
- [ ] T101 [P] [US2] Implement POST /users/:userId/skills controller (add skill)
- [ ] T102 [P] [US2] Implement DELETE /users/:userId/skills/:skillId controller (remove skill)
- [ ] T103 [P] [US2] Implement PUT /users/:userId/availability controller (set availability)
- [ ] T104 [US2] Create skills routes in packages/api/src/adapters/http/routes/skills.ts

### Frontend for User Story 2

- [ ] T105 [P] [US2] Create skill selector component with autocomplete in packages/frontend/src/features/skills/SkillSelector.tsx
- [ ] T106 [P] [US2] Create skill profile list component in packages/frontend/src/features/skills/SkillProfileList.tsx
- [ ] T107 [P] [US2] Create availability settings form in packages/frontend/src/features/skills/AvailabilityForm.tsx
- [ ] T108 [US2] Create skill mapping page in packages/frontend/src/routes/profile/skills.tsx
- [ ] T109 [US2] Create availability settings page in packages/frontend/src/routes/profile/availability.tsx
- [ ] T110 [P] [US2] Add i18n translations for skills (FR/EN) in packages/frontend/src/i18n/locales/{en,fr}/skills.json
- [ ] T110a [US2] Create ADR-006: i18next Namespace Organization in docs/adr/006-i18next-namespaces.md

**Checkpoint**: User Story 2 complete - Employees have skill profiles and availability set

---

## Phase 5: User Story 3 - Declare Skill Needs & Search Talent (Priority: P1)

**Goal**: HR managers specify skill needs and search anonymized talent pool for matches

**Independent Test**: Create skill need, search talent pool with filters, view anonymized matches

**Entities**: SkillNeed

**Contracts**: missions.yaml (skill-needs endpoints), skills.yaml (talent search)

### Tests for User Story 3

- [ ] T111 [P] [US3] Contract test: POST /skill-needs validates creation per OpenAPI in packages/api/tests/contract/missions.test.ts
- [ ] T112 [P] [US3] Contract test: GET /talent/search validates anonymized results in packages/api/tests/contract/skills.test.ts
- [ ] T113 [P] [US3] Unit test: SkillNeed entity validation in packages/domain/tests/entities/SkillNeed.test.ts
- [ ] T114 [P] [US3] Unit test: Talent anonymization logic in packages/domain/tests/use-cases/SearchTalent.test.ts
- [ ] T115 [P] [US3] Integration test: Create skill need with filters in packages/api/tests/integration/skill-needs.test.ts
- [ ] T116 [P] [US3] Integration test: Search talent pool with <2s response (SC-018) in packages/api/tests/integration/talent-search.test.ts
- [ ] T117 [P] [US3] E2E test: Post skill need and search talent in tests/e2e/skill-needs-search.spec.ts

### Database Layer for User Story 3

- [ ] T118 [US3] Define SkillNeed schema in packages/database/src/schema/missions.ts
- [ ] T119 [US3] Generate and review migration for SkillNeed table
- [ ] T120 [US3] Create indexes for skill search performance (idx_user_skills_skill_id, idx_talent_availability_pct)

### Domain Layer for User Story 3

- [ ] T121 [P] [US3] Create SkillNeed entity in packages/domain/src/entities/SkillNeed.ts
- [ ] T122 [P] [US3] Define SkillNeedRepository port in packages/domain/src/ports/repositories/SkillNeedRepository.ts
- [ ] T123 [US3] Implement CreateSkillNeed use case (talent_manager only) in packages/domain/src/use-cases/skill-needs/CreateSkillNeed.ts
- [ ] T124 [US3] Implement SearchTalent use case with anonymization (FR-017) in packages/domain/src/use-cases/skills/SearchTalent.ts
- [ ] T125 [US3] Implement AnonymizeUserProfile utility in packages/domain/src/utils/anonymization.ts

### Repository Adapters for User Story 3

- [ ] T126 [P] [US3] Implement DrizzleSkillNeedRepository in packages/database/src/repositories/DrizzleSkillNeedRepository.ts
- [ ] T127 [P] [US3] Implement talent search query with joins (user_skills + talent_availability) in packages/database/src/repositories/DrizzleTalentRepository.ts
- [ ] T128 [P] [US3] Write integration tests for SkillNeedRepository in packages/database/tests/repositories/SkillNeedRepository.test.ts

### API Layer for User Story 3

- [ ] T129 [P] [US3] Implement POST /skill-needs controller in packages/api/src/adapters/http/controllers/SkillNeedsController.ts
- [ ] T130 [P] [US3] Implement GET /skill-needs controller (list open needs)
- [ ] T131 [P] [US3] Implement GET /talent/search controller with anonymization in packages/api/src/adapters/http/controllers/TalentController.ts
- [ ] T132 [US3] Create skill-needs routes in packages/api/src/adapters/http/routes/skill-needs.ts
- [ ] T133 [US3] Add permission check for CreateSkillNeed (talent_manager role only)
- [ ] T133a [US3] Create ADR-007: Talent Anonymization Strategy in docs/adr/007-talent-anonymization.md

### Frontend for User Story 3

- [ ] T134 [P] [US3] Create skill need form component in packages/frontend/src/features/skill-needs/SkillNeedForm.tsx
- [ ] T135 [P] [US3] Create talent search filters component in packages/frontend/src/features/talent/TalentSearchFilters.tsx
- [ ] T136 [P] [US3] Create anonymized talent card component in packages/frontend/src/features/talent/AnonymizedTalentCard.tsx
- [ ] T137 [US3] Create skill needs page in packages/frontend/src/routes/skill-needs/index.tsx
- [ ] T138 [US3] Create talent search page in packages/frontend/src/routes/talent/search.tsx
- [ ] T139 [P] [US3] Add i18n translations for skill needs and talent search in packages/frontend/src/i18n/locales/{en,fr}/talent.json

**Checkpoint**: User Story 3 complete - Managers can post needs and search anonymized talent pool

---

## Phase 6: User Story 4 - Negotiate & Approve Missions (Priority: P2)

**Goal**: Companies negotiate mission terms and complete 3-step approval workflow (employee → manager → legal)

**Independent Test**: Two companies agree on mission terms, complete full approval workflow, finalize mission

**Entities**: Mission, Approval, NDA

**Contracts**: missions.yaml (mission lifecycle, approvals, NDA endpoints)

### Tests for User Story 4

- [ ] T140 [P] [US4] Contract test: POST /missions validates proposal per OpenAPI in packages/api/tests/contract/missions.test.ts
- [ ] T141 [P] [US4] Contract test: POST /missions/:id/approvals validates approval workflow in packages/api/tests/contract/missions.test.ts
- [ ] T142 [P] [US4] Unit test: Mission state machine transitions in packages/domain/tests/entities/Mission.test.ts
- [ ] T143 [P] [US4] Unit test: Approval workflow logic in packages/domain/tests/use-cases/ApproveMission.test.ts
- [ ] T144 [P] [US4] Integration test: Complete mission approval workflow in packages/api/tests/integration/mission-workflow.test.ts
- [ ] T145 [P] [US4] Integration test: Re-authentication for critical operations (FR-042) in packages/api/tests/integration/mission-approval-reauth.test.ts
- [ ] T146 [P] [US4] E2E test: Full mission proposal to activation flow in tests/e2e/mission-workflow.spec.ts

### Database Layer for User Story 4

- [ ] T147 [P] [US4] Define Mission schema with status enum in packages/database/src/schema/missions.ts
- [ ] T148 [P] [US4] Define Approval schema (3 types: employee_consent, manager_approval, legal_check) in packages/database/src/schema/missions.ts
- [ ] T149 [P] [US4] Define NDA schema in packages/database/src/schema/missions.ts
- [ ] T150 [US4] Generate and review migration for Mission, Approval, NDA tables
- [ ] T151 [US4] Create indexes for mission queries (idx_missions_status, idx_missions_talent_user)

### Domain Layer for User Story 4

- [ ] T152 [P] [US4] Create Mission entity with state machine in packages/domain/src/entities/Mission.ts
- [ ] T153 [P] [US4] Create Approval entity in packages/domain/src/entities/Approval.ts
- [ ] T154 [P] [US4] Create NDA entity in packages/domain/src/entities/NDA.ts
- [ ] T155 [P] [US4] Define MissionRepository port in packages/domain/src/ports/repositories/MissionRepository.ts
- [ ] T156 [P] [US4] Define ApprovalRepository port in packages/domain/src/ports/repositories/ApprovalRepository.ts
- [ ] T157 [US4] Implement ProposeMission use case in packages/domain/src/use-cases/missions/ProposeMission.ts
- [ ] T158 [US4] Implement NegotiateMission use case (counter-proposals FR-023) in packages/domain/src/use-cases/missions/NegotiateMission.ts
- [ ] T159 [US4] Implement SubmitApproval use case (3-step workflow) in packages/domain/src/use-cases/missions/SubmitApproval.ts
- [ ] T160 [US4] Implement CancelMission use case (before consent FR-025) in packages/domain/src/use-cases/missions/CancelMission.ts
- [ ] T161 [US4] Implement SignNDA use case (electronic acceptance FR-024) in packages/domain/src/use-cases/missions/SignNDA.ts
- [ ] T161a [US4] Create ADR-008: Mission State Machine Pattern in docs/adr/008-mission-state-machine.md

### Repository Adapters for User Story 4

- [ ] T162 [P] [US4] Implement DrizzleMissionRepository with state transitions in packages/database/src/repositories/DrizzleMissionRepository.ts
- [ ] T163 [P] [US4] Implement DrizzleApprovalRepository in packages/database/src/repositories/DrizzleApprovalRepository.ts
- [ ] T164 [P] [US4] Write integration tests for MissionRepository in packages/database/tests/repositories/MissionRepository.test.ts

### API Layer for User Story 4

- [ ] T165 [P] [US4] Implement POST /missions controller (propose mission) in packages/api/src/adapters/http/controllers/MissionsController.ts
- [ ] T166 [P] [US4] Implement PUT /missions/:id/negotiate controller (counter-proposal)
- [ ] T167 [P] [US4] Implement POST /missions/:id/approvals controller (submit approval)
- [ ] T168 [P] [US4] Implement POST /missions/:id/cancel controller (cancel before consent)
- [ ] T169 [P] [US4] Implement re-authentication middleware for manager/legal approvals (FR-042) in packages/api/src/middleware/reauth.ts
- [ ] T170 [US4] Create missions routes in packages/api/src/adapters/http/routes/missions.ts
- [ ] T171 [US4] Add credit reservation logic on mission approval in packages/domain/src/use-cases/missions/ActivateMission.ts

### Frontend for User Story 4

- [ ] T172 [P] [US4] Create mission proposal form in packages/frontend/src/features/missions/MissionProposalForm.tsx
- [ ] T173 [P] [US4] Create negotiation interface with counter-proposal in packages/frontend/src/features/missions/NegotiationPanel.tsx
- [ ] T174 [P] [US4] Create approval inbox component in packages/frontend/src/features/missions/ApprovalInbox.tsx
- [ ] T175 [P] [US4] Create NDA review and acceptance component in packages/frontend/src/features/missions/NDAReview.tsx
- [ ] T176 [P] [US4] Create mission status timeline component in packages/frontend/src/features/missions/MissionTimeline.tsx
- [ ] T177 [US4] Create mission proposal page in packages/frontend/src/routes/missions/new.tsx
- [ ] T178 [US4] Create mission approval workflow page in packages/frontend/src/routes/missions/approvals.tsx
- [ ] T179 [P] [US4] Add i18n translations for missions (FR/EN) in packages/frontend/src/i18n/locales/{en,fr}/missions.json

**Checkpoint**: User Story 4 complete - Full mission workflow from proposal to activation works

---

## Phase 7: User Story 5 - Credit System & Transaction Management (Priority: P2)

**Goal**: Companies track credit balances, view transaction history, and admins adjust credits manually

**Independent Test**: Company goes negative, admin adds credits, view full transaction history with filters

**Entities**: CreditTransaction

**Contracts**: credits.yaml (balance, transactions, adjustment endpoints)

### Tests for User Story 5

- [ ] T180 [P] [US5] Contract test: GET /companies/:id/credits validates balance response in packages/api/tests/contract/credits.test.ts
- [ ] T181 [P] [US5] Contract test: POST /companies/:id/credits/adjust validates admin adjustment in packages/api/tests/contract/credits.test.ts
- [ ] T182 [P] [US5] Unit test: Credit calculation logic (salary baseline FR-028) in packages/domain/tests/use-cases/CalculateMissionCredits.test.ts
- [ ] T183 [P] [US5] Integration test: Credit transaction creation and balance update in packages/api/tests/integration/credits.test.ts
- [ ] T184 [P] [US5] Integration test: Negative balance handling (FR-027) in packages/api/tests/integration/negative-balance.test.ts
- [ ] T185 [P] [US5] E2E test: Complete credit flow (mission → transaction → balance) in tests/e2e/credit-system.spec.ts

### Database Layer for User Story 5

- [ ] T186 [US5] CreditTransaction schema already defined in packages/database/src/schema/credits.ts (from Phase 2)
- [ ] T187 [US5] Generate and review migration for CreditTransaction table
- [ ] T188 [US5] Create indexes for transaction queries (idx_credit_transactions_company_id, idx_credit_transactions_type)

### Domain Layer for User Story 5

- [ ] T189 [P] [US5] Create CreditTransaction entity in packages/domain/src/entities/CreditTransaction.ts
- [ ] T190 [P] [US5] Define CreditTransactionRepository port in packages/domain/src/ports/repositories/CreditTransactionRepository.ts
- [ ] T191 [US5] Implement CalculateMissionCredits use case (salary baseline) in packages/domain/src/use-cases/credits/CalculateMissionCredits.ts
- [ ] T192 [US5] Implement RecordCreditTransaction use case in packages/domain/src/use-cases/credits/RecordCreditTransaction.ts
- [ ] T193 [US5] Implement GetCreditBalance use case in packages/domain/src/use-cases/credits/GetCreditBalance.ts
- [ ] T194 [US5] Implement GetTransactionHistory use case (with filters FR-031) in packages/domain/src/use-cases/credits/GetTransactionHistory.ts
- [ ] T195 [US5] Implement AdjustCredits use case (admin only FR-030) in packages/domain/src/use-cases/credits/AdjustCredits.ts

### Repository Adapters for User Story 5

- [ ] T196 [P] [US5] Implement DrizzleCreditTransactionRepository in packages/database/src/repositories/DrizzleCreditTransactionRepository.ts
- [ ] T197 [P] [US5] Write integration tests for CreditTransactionRepository in packages/database/tests/repositories/CreditTransactionRepository.test.ts

### API Layer for User Story 5

- [ ] T198 [P] [US5] Implement GET /companies/:id/credits controller in packages/api/src/adapters/http/controllers/CreditsController.ts
- [ ] T199 [P] [US5] Implement GET /companies/:id/credits/transactions controller (with filters)
- [ ] T200 [P] [US5] Implement POST /companies/:id/credits/adjust controller (admin only)
- [ ] T201 [US5] Create credits routes in packages/api/src/adapters/http/routes/credits.ts
- [ ] T202 [US5] Integrate credit transaction creation on mission activation in packages/api/src/adapters/http/controllers/MissionsController.ts

### Frontend for User Story 5

- [ ] T203 [P] [US5] Create credit balance card component in packages/frontend/src/features/credits/CreditBalanceCard.tsx
- [ ] T204 [P] [US5] Create transaction history table with filters in packages/frontend/src/features/credits/TransactionHistoryTable.tsx
- [ ] T205 [P] [US5] Create admin credit adjustment form in packages/frontend/src/features/credits/AdminCreditAdjustment.tsx
- [ ] T206 [US5] Create credit dashboard page in packages/frontend/src/routes/credits/index.tsx
- [ ] T207 [P] [US5] Add i18n translations for credits (FR/EN) in packages/frontend/src/i18n/locales/{en,fr}/credits.json

**Checkpoint**: User Story 5 complete - Credit system tracks all transactions and balances

---

## Phase 8: User Story 6 - Manage Active Missions & Track Progress (Priority: P3)

**Goal**: HR managers and employees track ongoing missions, log time, and mark milestones

**Independent Test**: Track active mission, log weekly hours, view progress, complete mission

**Entities**: TimeLog

**Contracts**: missions.yaml (time-logs endpoints)

### Tests for User Story 6

- [ ] T208 [P] [US6] Contract test: POST /missions/:id/time-logs validates time entry in packages/api/tests/contract/missions.test.ts
- [ ] T209 [P] [US6] Unit test: TimeLog validation (0-24 hours) in packages/domain/tests/entities/TimeLog.test.ts
- [ ] T210 [P] [US6] Integration test: Log time and track against commitment in packages/api/tests/integration/time-tracking.test.ts
- [ ] T211 [P] [US6] E2E test: Complete time tracking workflow in tests/e2e/mission-tracking.spec.ts

### Database Layer for User Story 6

- [ ] T212 [US6] Define TimeLog schema in packages/database/src/schema/missions.ts
- [ ] T213 [US6] Generate and review migration for TimeLog table
- [ ] T214 [US6] Create indexes for time log queries (idx_time_logs_mission_id)

### Domain Layer for User Story 6

- [ ] T215 [P] [US6] Create TimeLog entity in packages/domain/src/entities/TimeLog.ts
- [ ] T216 [P] [US6] Define TimeLogRepository port in packages/domain/src/ports/repositories/TimeLogRepository.ts
- [ ] T217 [US6] Implement LogTime use case (FR-032) in packages/domain/src/use-cases/missions/LogTime.ts
- [ ] T218 [US6] Implement GetMissionProgress use case in packages/domain/src/use-cases/missions/GetMissionProgress.ts
- [ ] T219 [US6] Implement CompleteMission use case (FR-035) in packages/domain/src/use-cases/missions/CompleteMission.ts
- [ ] T220 [US6] Implement SendProgressNotifications use case (FR-033) in packages/domain/src/use-cases/missions/SendProgressNotifications.ts

### Repository Adapters for User Story 6

- [ ] T221 [P] [US6] Implement DrizzleTimeLogRepository in packages/database/src/repositories/DrizzleTimeLogRepository.ts
- [ ] T222 [P] [US6] Write integration tests for TimeLogRepository in packages/database/tests/repositories/TimeLogRepository.test.ts

### API Layer for User Story 6

- [ ] T223 [P] [US6] Implement POST /missions/:id/time-logs controller in packages/api/src/adapters/http/controllers/MissionsController.ts
- [ ] T224 [P] [US6] Implement GET /missions/:id/time-logs controller (list time logs)
- [ ] T225 [P] [US6] Implement PUT /missions/:id/complete controller (mark complete)
- [ ] T226 [US6] Add time tracking routes to missions.ts

### Frontend for User Story 6

- [ ] T227 [P] [US6] Create time log form component in packages/frontend/src/features/missions/TimeLogForm.tsx
- [ ] T228 [P] [US6] Create mission progress dashboard in packages/frontend/src/features/missions/MissionProgressDashboard.tsx
- [ ] T229 [P] [US6] Create active missions list component in packages/frontend/src/features/missions/ActiveMissionsList.tsx
- [ ] T230 [US6] Create mission tracking page in packages/frontend/src/routes/missions/:id/track.tsx
- [ ] T231 [US6] Create mission completion page in packages/frontend/src/routes/missions/:id/complete.tsx

**Checkpoint**: User Story 6 complete - Mission tracking and time logging fully functional

---

## Phase 9: User Story 7 - Employee Self-Proposal & Opportunity Discovery (Priority: P3)

**Goal**: Employees browse opportunities and propose themselves for projects (requires manager approval)

**Independent Test**: Employee views open skill needs, proposes self, manager reviews and approves

**Contracts**: missions.yaml (employee self-proposal endpoints)

### Tests for User Story 7

- [ ] T232 [P] [US7] Contract test: POST /missions/self-propose validates employee proposal in packages/api/tests/contract/missions.test.ts
- [ ] T233 [P] [US7] Integration test: Employee self-proposal workflow in packages/api/tests/integration/self-proposal.test.ts
- [ ] T234 [P] [US7] E2E test: Employee proposes self, manager approves in tests/e2e/self-proposal.spec.ts

### Domain Layer for User Story 7

- [ ] T235 [US7] Implement SelfProposeMission use case in packages/domain/src/use-cases/missions/SelfProposeMission.ts
- [ ] T236 [US7] Implement ReviewEmployeeProposal use case (manager approval) in packages/domain/src/use-cases/missions/ReviewEmployeeProposal.ts

### API Layer for User Story 7

- [ ] T237 [P] [US7] Implement POST /missions/self-propose controller in packages/api/src/adapters/http/controllers/MissionsController.ts
- [ ] T238 [P] [US7] Implement GET /missions/employee-proposals controller (manager view)
- [ ] T239 [US7] Add self-proposal routes to missions.ts

### Frontend for User Story 7

- [ ] T240 [P] [US7] Create opportunity marketplace component for employees in packages/frontend/src/features/missions/OpportunityMarketplace.tsx
- [ ] T241 [P] [US7] Create employee self-proposal form in packages/frontend/src/features/missions/SelfProposalForm.tsx
- [ ] T242 [P] [US7] Create manager review panel for employee proposals in packages/frontend/src/features/missions/EmployeeProposalReview.tsx
- [ ] T243 [US7] Create opportunity marketplace page in packages/frontend/src/routes/opportunities/index.tsx
- [ ] T244 [US7] Create manager proposal review page in packages/frontend/src/routes/missions/employee-proposals.tsx

**Checkpoint**: User Story 7 complete - Employees can discover and self-propose for opportunities

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories, security, and production readiness

### i18n & Localization

- [ ] T245 [P] Validate all UI strings are in i18n namespaces (no hardcoded strings)
- [ ] T246 [P] Review French translations for accuracy (target <5% errors SC-003)
- [ ] T247 [P] Test language switching without page reload in packages/frontend/src/features/settings/LanguageSwitcher.tsx
- [ ] T248 [P] Format dates and numbers for FR/UK locales using i18next

### Security Hardening

- [ ] T249 [P] Run Snyk security scan and fix high/critical issues
- [ ] T250 [P] Implement audit logging for sensitive operations (FR-037) in packages/api/src/middleware/audit-logger.ts
- [ ] T251 [P] Verify rate limiting (FR-045) is enforced on all endpoints
- [ ] T252 [P] Test password breach checking via HIBP integration
- [ ] T253 [P] Verify session timeouts (24h talent, 4h talent_manager FR-041)
- [ ] T254 [P] Test re-authentication for critical operations (FR-042)

### GDPR Compliance

- [ ] T255 [P] Implement data export functionality (FR-038) in packages/api/src/adapters/http/controllers/GDPRController.ts
- [ ] T257 [P] Verify audit logging for all data access

### Performance Optimization

- [ ] T258 [P] Verify skill search <2s for 90% of queries (SC-018)
- [ ] T259 [P] Verify API endpoints <500ms p95 latency (Constitution standard)
- [ ] T260 [P] Load test with 100 concurrent users (SC-019)
- [ ] T261 [P] Optimize database indexes based on query analysis

### Documentation

- [ ] T262 [P] Validate quickstart.md works end-to-end (SC-010)
- [ ] T263 [P] Review all ADRs for completeness and consistency
- [ ] T264 [P] Update ADR index in docs/adr/README.md with all decisions
- [ ] T265 [P] Verify ADR references in implementation code comments
- [ ] T266 [P] Generate OpenAPI documentation for all endpoints

### Testing & Quality

- [ ] T267 Run all unit tests and verify 80% coverage for domain logic
- [ ] T268 Run all integration tests
- [ ] T269 Run all E2E tests (FR + EN)
- [ ] T270 Run contract tests to validate OpenAPI specs
- [ ] T271 [P] Test all user stories independently to verify isolation

### Deployment Preparation

- [ ] T272 [P] Create Dockerfile for API server
- [ ] T273 [P] Create docker-compose.yml for local development
- [ ] T274 [P] Setup CI/CD pipeline (GitHub Actions)
- [ ] T275 [P] Create production environment configuration
- [ ] T276 [P] Setup PostgreSQL migration for production (from SQLite)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational completion
  - US1, US2, US3 (P1): Can run in parallel after Foundational
  - US4, US5 (P2): Can run in parallel, but US4 depends on US1-3 entities, US5 depends on US4 (missions create transactions)
  - US6, US7 (P3): US6 depends on US4 (missions), US7 depends on US3+US4 (skill needs + missions)
- **Polish (Phase 10)**: Depends on all desired user stories

### User Story Dependencies

```
Foundational (Phase 2) ────┐
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    US1 (P1)           US2 (P1)           US3 (P1)
    Companies          Skills             Skill Needs
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                       US4 (P2)
                       Missions
                           │
                ┌──────────┴──────────┐
                │                     │
            US5 (P2)              US6 (P3)
            Credits               Tracking
                                      │
                                  US7 (P3)
                                  Self-Proposal
```

### Parallel Opportunities

**After Foundational phase completes:**

- US1, US2, US3 (P1 stories) can ALL run in parallel
- Within each story, all tasks marked [P] can run in parallel
- Different team members can work on different stories simultaneously

**Example Parallel Execution:**

```bash
# After Foundational completes, launch in parallel:
Developer A: Tasks T032-T074 (US1)
Developer B: Tasks T075-T110 (US2)
Developer C: Tasks T111-T139 (US3)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (7 tasks)
2. Complete Phase 2: Foundational (23 tasks) - CRITICAL CHECKPOINT
3. Complete Phase 3: US1 - Company Onboarding (43 tasks)
4. Complete Phase 4: US2 - Skill Mapping (36 tasks)
5. Complete Phase 5: US3 - Skill Needs & Search (29 tasks)
6. **STOP and VALIDATE**: Test all 3 stories independently
7. Deploy MVP with essential features

**MVP Total**: ~138 tasks (Setup + Foundational + US1-3)

### Incremental Delivery

**Release 1 (MVP)**: US1-3

- Companies can onboard ✅
- Employees can map skills ✅
- Managers can search talent ✅

**Release 2**: Add US4 (Missions)

- Full mission workflow ✅
- All P1+P2 scenarios work ✅

**Release 3**: Add US5 (Credits)

- Credit tracking operational ✅
- Network flexibility enabled ✅

**Release 4**: Add US6-7

- Mission tracking ✅
- Employee self-proposal ✅
- Full platform feature-complete ✅

### Parallel Team Strategy

With 3 developers:

1. **Week 1-2**: All work together on Setup + Foundational (30 tasks)
2. **Week 3-4**: Split after Foundational checkpoint:
   - Dev A: US1 (Company Onboarding)
   - Dev B: US2 (Skill Mapping)
   - Dev C: US3 (Skill Needs & Search)
3. **Week 5**: Integrate US1-3, test MVP
4. **Week 6+**: Continue with US4-7 in priority order

---

## Summary

**Total Tasks**: 276

- Phase 1 (Setup): 7 tasks
- Phase 2 (Foundational): 23 tasks
- Phase 3 (US1 - P1): 43 tasks
- Phase 4 (US2 - P1): 36 tasks
- Phase 5 (US3 - P1): 29 tasks
- Phase 6 (US4 - P2): 40 tasks
- Phase 7 (US5 - P2): 28 tasks
- Phase 8 (US6 - P3): 24 tasks
- Phase 9 (US7 - P3): 14 tasks
- Phase 10 (Polish): 32 tasks

**Parallel Opportunities**: 156 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:

- US1: Create company via invite, view dashboard
- US2: Complete skill profile, set availability
- US3: Post skill need, search talent pool
- US4: Complete full mission approval workflow
- US5: View credits, admin adjusts balance
- US6: Log time, track progress, complete mission
- US7: Employee proposes self, manager approves

**MVP Scope**: Phase 1 + Phase 2 + US1-3 (138 tasks, ~2-3 weeks with 3 developers)

---

## Notes

- All tests MUST fail before implementation (Red-Green-Refactor)
- Commit atomically after each working feature (Constitution requirement)
- Each user story is independently testable and deployable
- Stop at any checkpoint to validate story completion
- Run quickstart.md validation in Phase 10
- Security and performance checks in Phase 10 before production
