# ES-Mono Architecture Constraints

**Version**: 1.0.0
**Last Updated**: 2025-11-08
**Status**: MANDATORY - All implementation must follow these constraints

This document defines the technical architecture decisions for the SkillSwap platform. These constraints are **non-negotiable** and must be respected during the planning and implementation phases.

## Core Architectural Principles

### Hexagonal Architecture (Ports & Adapters)

The system must follow hexagonal architecture principles to ensure:

- **Technology Independence**: Easy to swap databases, frameworks, external services
- **Testability**: Business logic isolated from infrastructure concerns
- **Maintainability**: Clear separation of concerns

**Structure**:

- **Domain Core**: Pure business logic, no external dependencies
- **Ports**: Interfaces defining how the domain communicates with the outside world
- **Adapters**: Concrete implementations of ports (database, HTTP, external APIs)

## Technology Stack

### Required Technologies

#### Package Management & Build

- **Package Manager**: pnpm (workspace feature required)
- **Language**: TypeScript (all packages)
- **Build Tool**: Vite (for frontend and bundling)
- **Monorepo Structure**: pnpm workspace

#### Frontend Stack

- **Framework**: React 18+
- **Router**: TanStack Router (type-safe routing)
- **Bundler**: Vite
- **UI Components**: shadcn/ui (separate design-system package)
- **Internationalization**: i18next + react-i18next (FR/EN support)

#### Backend/API Stack

- **API Framework**: Hono (with RPC for type-safe client/server communication)
- **API Style**: RESTful
- **Type Sharing**: Hono RPC system ([docs](https://hono.dev/docs/guides/rpc))
- **Runtime**: Node.js (or Bun if preferred for performance)

#### Database & ORM

- **ORM**: Drizzle ORM
- **Initial Database**: SQLite (development and early production)
- **Target Database**: PostgreSQL (architecture must support migration)
- **Migration Path**: Drizzle supports SQLite → PostgreSQL migration with minimal code changes

#### Authentication & Authorization

- **Phase 1 (MVP)**: Lucia Auth (lightweight, TypeScript-first, self-hosted)
- **Phase 2 (Production Scale)**: Clerk (managed auth, multi-tenant, invite system)
- **Migration Strategy**: Abstract auth behind a port/interface to enable swap

#### Testing

- **Unit Tests**: Vitest (Vite-native, fast)
- **API Integration Tests**: Supertest (HTTP assertions)
- **E2E Tests**: Playwright (cross-browser, multi-language support)
- **Component Tests**: Vitest + Testing Library

## Monorepo Package Structure

### Required Packages

```
es-mono/
├── packages/
│   ├── domain/           # Pure domain logic (hexagonal core)
│   ├── database/         # Database schemas, migrations, ORM config
│   ├── api/              # Hono REST API (hexagonal adapters)
│   ├── frontend/         # React + Vite application
│   ├── design-system/    # shadcn-based UI component library
│   └── shared/           # Shared utilities, types, constants
├── apps/                 # (Optional) if apps need to be separate from packages
├── docs/                 # Architecture, ADRs, guides
└── pnpm-workspace.yaml
```

### Package Responsibilities

#### `packages/domain`

- **Purpose**: Pure business logic, domain entities, use cases
- **Dependencies**: ZERO external dependencies (except minimal utils like date libraries if needed)
- **Exports**:
  - Domain entities (User, Company, Skill, Exchange, etc.)
  - Use cases / application services
  - Domain events
  - Port interfaces (repositories, services)
- **Consumed By**: All other packages (api, frontend via shared types)

#### `packages/database`

- **Purpose**: Database schemas, migrations, ORM configuration
- **Dependencies**: Drizzle ORM, domain package
- **Exports**:
  - Drizzle schema definitions
  - Migration files
  - Database connection utilities
  - Repository implementations (adapters for domain ports)
- **Database Strategy**:
  - Schema designed for PostgreSQL compatibility from day 1
  - Use PostgreSQL-compatible types even in SQLite
  - Avoid SQLite-specific features that don't translate to PostgreSQL

#### `packages/api`

- **Purpose**: HTTP API layer using Hono
- **Architecture**: Hexagonal (ports & adapters)
  - **Ports**: Defined in `domain` package
  - **Adapters**:
    - HTTP controllers (Hono routes)
    - Database repositories (from `database` package)
    - External service clients (email, payment, etc.)
- **Dependencies**: Hono, domain, database, shared
- **Exports**: Hono RPC types for frontend consumption
- **Structure**:
  ```
  packages/api/
  ├── src/
  │   ├── adapters/
  │   │   ├── http/          # Hono routes, controllers
  │   │   ├── repositories/  # Database adapters
  │   │   └── external/      # Third-party service adapters
  │   ├── config/            # App configuration
  │   ├── middleware/        # Auth, validation, error handling
  │   └── index.ts           # Hono app setup, RPC exports
  ```

#### `packages/frontend`

- **Purpose**: React application with Vite
- **Dependencies**: React, TanStack Router, design-system, shared, Hono RPC client
- **Key Features**:
  - Type-safe API calls via Hono RPC
  - i18next for FR/EN internationalization
  - TanStack Router for type-safe routing
- **Structure**:
  ```
  packages/frontend/
  ├── src/
  │   ├── features/         # Feature-based modules
  │   ├── routes/           # TanStack Router routes
  │   ├── lib/              # API client (Hono RPC), utils
  │   ├── i18n/             # Translation files (fr.json, en.json)
  │   └── App.tsx
  ```

#### `packages/design-system`

- **Purpose**: Shared UI component library
- **Base**: shadcn/ui components
- **Dependencies**: React, Tailwind CSS, Radix UI (shadcn dependencies)
- **Exports**: Reusable components (Button, Input, Modal, etc.)
- **Customization**: Brand colors, typography, spacing tokens

#### `packages/shared`

- **Purpose**: Cross-cutting utilities and types
- **Exports**:
  - Type definitions shared between frontend/backend
  - Validation schemas (Zod schemas for API contracts)
  - Constants (error codes, status enums)
  - Utility functions (date formatting, string manipulation)

## Hexagonal Architecture Implementation

### API Package Hexagonal Design

```
packages/api/src/
├── adapters/
│   ├── http/
│   │   ├── controllers/
│   │   │   ├── CompanyController.ts      # HTTP → Use Case
│   │   │   ├── EmployeeController.ts
│   │   │   └── ExchangeController.ts
│   │   └── routes/
│   │       └── index.ts                  # Hono route definitions
│   ├── repositories/
│   │   ├── DrizzleCompanyRepository.ts   # Port implementation
│   │   ├── DrizzleEmployeeRepository.ts
│   │   └── DrizzleExchangeRepository.ts
│   └── external/
│       ├── ClerkAuthAdapter.ts           # Auth port implementation
│       └── EmailServiceAdapter.ts
├── config/
│   └── container.ts                      # Dependency injection setup
└── index.ts                              # Hono app, RPC exports
```

**Key Principles**:

1. **Controllers** receive HTTP requests, call use cases from `domain` package
2. **Repositories** implement port interfaces defined in `domain`
3. **External adapters** implement service ports (auth, email, payments)
4. **Dependency Injection**: Use a simple container to wire adapters to ports

### Domain Package Structure

```
packages/domain/src/
├── entities/
│   ├── Company.ts
│   ├── Employee.ts
│   ├── Skill.ts
│   └── Exchange.ts
├── use-cases/
│   ├── CreateExchange.ts
│   ├── MatchTalentWithSkillNeed.ts
│   └── ApproveExchange.ts
├── ports/
│   ├── repositories/
│   │   ├── CompanyRepository.ts          # Interface
│   │   ├── EmployeeRepository.ts
│   │   └── ExchangeRepository.ts
│   └── services/
│       ├── AuthService.ts                # Interface
│       └── EmailService.ts
└── events/
    ├── ExchangeCreated.ts
    └── SkillMatchFound.ts
```

## Database Strategy

### SQLite → PostgreSQL Migration Path

**Phase 1: SQLite (Development & MVP)**

- Use SQLite for rapid development
- Local file-based database (easy setup)
- Good performance for MVP scale (<10k users)

**Phase 2: PostgreSQL (Production Scale)**

- Horizontal scaling support
- Advanced features (full-text search, JSON queries)
- Better concurrency handling

**Migration Requirements**:

1. **Schema Compatibility**:
   - Use PostgreSQL-compatible types from day 1
   - Avoid SQLite-specific features (e.g., dynamic typing)
   - Example: Use `INTEGER` not `INT`, `TEXT` not `VARCHAR(255)`

2. **Drizzle Configuration**:

   ```typescript
   // packages/database/src/drizzle.config.ts
   export default {
     schema: './src/schema.ts',
     out: './migrations',
     driver: process.env.DB_TYPE === 'postgres' ? 'pg' : 'better-sqlite3',
     dbCredentials: {
       /* ... */
     },
   };
   ```

3. **Repository Abstraction**:
   - All database queries through repository interfaces
   - No raw SQL in use cases
   - Drizzle ORM handles dialect differences

### Database Package Exports

```typescript
// packages/database/src/index.ts
export { db } from './connection';
export * from './schema';
export { CompanyRepository } from './repositories/CompanyRepository';
export { migrate } from './migrate';
```

## Authentication Strategy

### Phase 1: Lucia Auth (MVP)

**Why Lucia**:

- Lightweight, no external dependencies
- Full control over auth flow
- TypeScript-first
- Free (self-hosted)

**Implementation**:

```typescript
// packages/domain/src/ports/services/AuthService.ts
export interface AuthService {
  createSession(userId: string): Promise<Session>;
  validateSession(sessionId: string): Promise<Session | null>;
  invalidateSession(sessionId: string): Promise<void>;
}

// packages/api/src/adapters/external/LuciaAuthAdapter.ts
export class LuciaAuthAdapter implements AuthService {
  // Lucia implementation
}
```

### Phase 2: Clerk (Production)

**Why Clerk**:

- Multi-tenant out of the box
- Built-in invite system (perfect for company invites)
- User management UI
- Generous free tier (10k MAU)

**Migration Path**:

1. Create `ClerkAuthAdapter` implementing `AuthService` port
2. Swap adapter in dependency injection container
3. Migrate user data (Clerk provides migration APIs)

## Internationalization (i18n)

### i18next Configuration

**Languages**: French (FR), English (EN)

**Structure**:

```
packages/frontend/src/i18n/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── exchange.json
│   │   └── skills.json
│   └── fr/
│       ├── common.json
│       ├── exchange.json
│       └── skills.json
├── config.ts
└── index.ts
```

**Namespace Strategy**:

- `common`: Shared UI strings (buttons, errors, navigation)
- `exchange`: Exchange-specific terms
- `skills`: Skill taxonomy translations

**Backend Consideration**:

- Email templates also need i18n
- Store user language preference in database
- API accepts `Accept-Language` header

## API Design (Hono RPC)

### Type-Safe Client/Server Communication

**Server (packages/api)**:

```typescript
// packages/api/src/index.ts
const app = new Hono()
  .route('/companies', companyRoutes)
  .route('/employees', employeeRoutes)
  .route('/exchanges', exchangeRoutes);

export type AppType = typeof app;
```

**Client (packages/frontend)**:

```typescript
// packages/frontend/src/lib/api.ts
import { hc } from 'hono/client';
import type { AppType } from '@es-mono/api';

export const client = hc<AppType>('/api');

// Usage: Fully type-safe!
const companies = await client.companies.$get();
```

**Benefits**:

- End-to-end type safety
- Auto-completion in frontend
- Refactoring safety (rename endpoints, types update automatically)

## Testing Strategy

### Unit Tests (Vitest)

**Target**: Domain logic, use cases, utilities

```typescript
// packages/domain/tests/use-cases/CreateExchange.test.ts
describe('CreateExchange use case', () => {
  it('should create exchange when all conditions met', async () => {
    const mockRepo = createMockExchangeRepository();
    const useCase = new CreateExchange(mockRepo);
    // Test pure business logic
  });
});
```

### Integration Tests (Supertest + Vitest)

**Target**: API endpoints, database interactions

```typescript
// packages/api/tests/integration/exchanges.test.ts
describe('POST /exchanges', () => {
  it('should create exchange and return 201', async () => {
    const response = await request(app).post('/exchanges').send(exchangeData);
    expect(response.status).toBe(201);
  });
});
```

### E2E Tests (Playwright)

**Target**: Critical user journeys

```typescript
// tests/e2e/exchange-flow.spec.ts
test('HR manager can create and approve exchange', async ({ page }) => {
  await page.goto('/exchanges/new');
  // Test full workflow from UI
});
```

**Multi-language Testing**:

- Test critical flows in both FR and EN
- Playwright supports locale switching

## Deployment Considerations

### Development

- SQLite database (local file)
- Vite dev server (frontend)
- Hono development server (API)
- pnpm dev script runs all packages concurrently

### Production (Future)

- PostgreSQL database (managed service: Supabase, Neon, Railway)
- Frontend: Deploy to Vercel/Netlify (static assets)
- API: Deploy to Fly.io, Railway, or AWS Lambda (Hono is edge-compatible)
- Separate deployments for API and frontend (allows independent scaling)

## Migration Path Checklist

When migrating from SQLite to PostgreSQL:

- [ ] Update `DATABASE_URL` environment variable
- [ ] Run Drizzle migrations: `pnpm --filter @es-mono/database migrate`
- [ ] Test all repository implementations
- [ ] Update connection pooling configuration
- [ ] Verify JSON column handling (SQLite TEXT vs PostgreSQL JSONB)
- [ ] Update full-text search (SQLite FTS vs PostgreSQL `tsvector`)
- [ ] Load test with production-scale data

## Architecture Decision Records (ADRs)

**MANDATORY**: All significant architectural decisions MUST be documented in ADRs.

### What Requires an ADR?

Create an ADR when:

1. **Choosing or changing core technologies** (e.g., switching ORMs, adding a payment provider)
2. **Deviating from architecture constraints** defined in this document
3. **Adding new packages** to the monorepo
4. **Changing fundamental patterns** (e.g., modifying hexagonal architecture approach)
5. **Making decisions with long-term implications** (e.g., database migration strategy)

See [docs/adr/README.md](adr/README.md) for complete guidelines.

### ADR Process for Implementation Agents

When using `/speckit.implement` or making implementation decisions:

1. **Before Implementation**: Check `docs/adr/` for relevant existing decisions
2. **During Implementation**: If making a significant decision (see criteria above):
   - Copy `docs/adr/template.md`
   - Number it sequentially (next available number)
   - Fill in all sections: Context, Options, Decision, Consequences
   - Mark status as "Proposed"
   - Create the ADR file before proceeding with implementation
3. **After Implementation**: Update ADR status to "Implemented"

**Location**: `docs/adr/`
**Template**: `docs/adr/template.md`
**Naming**: `NNN-title-in-kebab-case.md` (e.g., `001-choose-drizzle-orm.md`)
**Index**: Maintained in `docs/adr/README.md`

## Compliance with Constitution

This architecture enforces the ES-Mono Constitution principles:

- **Test-First Development**: Hexagonal architecture enables easy mocking for TDD
- **Feature Isolation**: Monorepo packages can be developed independently
- **Security by Design**: Auth abstraction allows security upgrades without business logic changes
- **Observability**: Adapters can inject logging/monitoring without touching domain
- **Simplicity**: SQLite first, PostgreSQL when needed (YAGNI)

## Questions or Deviations

If implementation requires deviation from these constraints:

1. Document rationale in an ADR
2. Update this document with amendment
3. Get approval from tech lead
4. Run `/speckit.constitution` if principles affected
