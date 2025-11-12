<!--
Sync Impact Report - Constitution v1.0.3

Version Change: 1.0.2 → 1.0.3 (PATCH)
Amendment Type: Technical standard clarification for form library usage

Changes Made:
- Added form library standard requirement to Code Quality section
- Specified TanStack Form as mandatory for all React forms
- Added reference to ADR-005 for implementation details
- Documented required validator patterns (onChange + onSubmit)

Rationale:
- PATCH version: Non-breaking technical standard clarification
- Codifies existing practice (forms already use TanStack Form)
- Ensures consistency across future form implementations
- Improves maintainability with single, documented pattern
- No changes to core principles or governance structure
- ADR-005 provides complete technical justification

Previous Changes (v1.0.2):
- Enhanced atomic commits requirement in Branching & Commits section
- Added explicit requirement for implementation agents to commit at every working feature step
- Added atomic commits verification to Pull Request Checklist
- Added atomic commits requirement to Code Quality standards

Previous Changes (v1.0.1):
- Added ADR (Architecture Decision Record) requirement to Documentation Requirements
- Added ADR checklist item to Pull Request Checklist
- Updated Code Review Requirements to include ADR verification

Templates Status:
- ✅ plan-template.md: No changes needed (ADRs are implementation-phase concern)
- ✅ spec-template.md: No changes needed (ADRs are for technical decisions, not specs)
- ✅ tasks-template.md: No changes needed (tasks reference existing architecture)
- ✅ Commands: Implementation commands should now check/create ADRs
- ✅ architecture.md: Updated with detailed ADR process for agents

Follow-up TODOs: None

Notes:
- ADR template, README, and initial ADR-000 created in docs/adr/
- Implementation agents now have clear guidance on when/how to create ADRs
- Maintains alignment with all 5 core principles
- Previous Notes (v1.0.0):
  - Initial constitution tailored for employee share management monorepo
  - Emphasizes security due to financial/sensitive data nature
  - Focuses on incremental delivery and independent testability
  - Snyk security integration already configured in .github/instructions/
-->

# ES-Mono Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

**Rule**: Tests MUST be written before implementation. Red-Green-Refactor cycle is mandatory.

- Write acceptance/integration/contract tests first
- Verify tests fail before implementing features
- User approval required before implementation begins
- Tests define the contract and expected behavior

**Rationale**: Test-first development catches design flaws early, ensures testability, creates executable specifications, and prevents scope creep. In a financial/employee share context, correctness is paramount.

### II. Feature Isolation & Independence

**Rule**: Each user story MUST be independently implementable, testable, and deployable.

- User stories are prioritized (P1, P2, P3, etc.)
- Each story delivers standalone value (MVP-capable)
- Stories can be developed in parallel by different team members
- Dependencies between stories must be minimized and explicit
- Foundational infrastructure is isolated in a dedicated phase

**Rationale**: Independent features enable incremental delivery, reduce integration risk, support parallel development, and allow rollback of individual features without affecting others. Critical for agile iteration in complex monorepo environments.

### III. Security by Design

**Rule**: Security MUST be considered at every stage of development.

- Never commit credentials, API keys, or sensitive data to version control
- Run Snyk security scans on all new/modified code before merge
- Fix identified security issues before proceeding with additional features
- Input validation is mandatory for all user-supplied data
- Authentication and authorization checked at every endpoint
- Audit logging required for all sensitive operations (financial data, user modifications)

**Rationale**: Employee share management involves sensitive personal and financial data. Security vulnerabilities can lead to regulatory violations, data breaches, and loss of user trust. Prevention is exponentially cheaper than remediation.

### IV. Observability & Debugging

**Rule**: Systems MUST be observable and debuggable in production.

- Structured logging required for all critical operations
- Error messages must be actionable and include context
- Logging must not leak sensitive data (mask PII, credentials, tokens)
- Health checks and metrics for monitoring system state
- Distributed tracing for cross-service requests (in multi-service scenarios)

**Rationale**: Text-based I/O and structured logging enable rapid debugging without specialized tools. In production systems handling employee compensation, the ability to quickly diagnose and resolve issues is critical.

### V. Simplicity & YAGNI (You Aren't Gonna Need It)

**Rule**: Implement the simplest solution that solves the current problem.

- No speculative features or abstractions
- Start with direct implementations; refactor when patterns emerge
- Complexity requires explicit justification in implementation plan
- Three or fewer projects/services unless justified
- Prefer composition over inheritance
- Avoid premature optimization

**Rationale**: Unnecessary complexity increases maintenance burden, onboarding time, and bug surface area. Simple solutions are easier to understand, test, modify, and debug. Build what you need now, not what you might need later.

## Quality Standards

### Code Quality

- All code must pass linting and formatting checks
- Code coverage targets: 80% minimum for business logic
- All public APIs must be documented
- Complex algorithms require inline comments explaining the "why"
- No commented-out code in main branch
- **Atomic commits required**: Each working feature increment must be committed with all tests passing
- **Form library standard**: All React forms MUST use TanStack Form (`@tanstack/react-form`) with consistent validator patterns (`onChange` + `onSubmit`) as documented in [ADR-005](./adr/005-use-tanstack-form-for-react-forms.md)

### Performance Standards

- API endpoints: <500ms p95 latency for CRUD operations
- Background jobs: Progress tracking for operations >30 seconds
- Database queries: Indexed for common access patterns
- Pagination required for list operations (max 100 items per page)

### Documentation Requirements

- Each feature requires a quickstart guide demonstrating core functionality
- API contracts documented in contracts/ directory using OpenAPI/AsyncAPI where applicable
- Data models documented with field descriptions and constraints
- README must include setup, development, and deployment instructions
- **Architecture Decision Records (ADRs)**: All significant architectural decisions MUST be documented in `docs/adr/` following the template in `docs/adr/template.md` (see criteria in `docs/adr/README.md`)

## Development Workflow

### Feature Development Process

1. **Specification** (`/speckit.specify`): User describes feature → Spec document created with prioritized user stories
2. **Planning** (`/speckit.plan`): Research + design → Implementation plan with architecture decisions
3. **Task Generation** (`/speckit.tasks`): Design artifacts → Dependency-ordered task list organized by user story
4. **Implementation** (`/speckit.implement`): Execute tasks in priority order, user stories independently testable
5. **Validation** (`/speckit.checklist`): Run feature-specific checklist before PR

### Branching & Commits

- Feature branches: `###-feature-name` format (issue number + description)
- Commit messages: Conventional commits format (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- **Atomic commits**: Each commit represents a single logical change. **Implementation agents MUST commit at every step when a new working feature is added**, ensuring all tests pass before committing. Each commit should represent a complete, working increment of functionality.
- No direct commits to main branch; all changes via pull request

### Code Review Requirements

- All PRs require approval before merge
- Reviewer must verify:
  - Tests exist and pass
  - Constitution principles followed
  - Security scan (Snyk) passed
  - Documentation updated (including ADRs if applicable)
  - No regression in existing functionality

### Pull Request Checklist

- [ ] All tests pass (unit, integration, contract)
- [ ] Security scan passed with no high/critical issues
- [ ] Code coverage maintained or improved
- [ ] Documentation updated
- [ ] Commits follow conventional commit format
- [ ] **Atomic commits verified**: Each commit represents a working feature increment with passing tests
- [ ] Constitution compliance verified
- [ ] Breaking changes documented in PR description
- [ ] ADR created if significant architectural decision made (see `docs/adr/README.md` for criteria)

## Governance

### Authority & Precedence

This constitution supersedes all other development practices, guidelines, and conventions. When conflicts arise, this document takes precedence.

### Amendment Process

1. Propose amendment with rationale and impact analysis
2. Document version bump rationale:
   - **MAJOR**: Principle removal/redefinition, backward incompatible governance changes
   - **MINOR**: New principle/section, materially expanded guidance
   - **PATCH**: Clarifications, wording improvements, typo fixes
3. Update constitution and run `/speckit.constitution` to propagate changes
4. Review all dependent templates for consistency
5. Communicate changes to all team members
6. Update in-flight work to comply (or document exceptions)

### Compliance Review

- All pull requests must verify compliance with this constitution
- `/speckit.analyze` command performs cross-artifact consistency checks
- Complexity violations require explicit justification in plan.md
- Team lead responsible for resolving constitution interpretation questions

### Version Control

All changes to this constitution are version controlled. The Sync Impact Report (HTML comment at top of file) tracks changes and propagation status.

### Runtime Development Guidance

For agent-specific runtime guidance (tool usage patterns, execution context, agent-specific instructions), see individual command files in `.claude/commands/`. This constitution defines project-wide governance; command files define execution patterns.

**Version**: 1.0.3 | **Ratified**: 2025-11-08 | **Last Amended**: 2025-11-11
