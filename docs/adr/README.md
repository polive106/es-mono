# Architecture Decision Records (ADR)

## Purpose

This directory contains Architecture Decision Records (ADRs) that document significant architectural and technical decisions made during the development of the ES-Mono platform.

## What Requires an ADR?

Create an ADR for decisions that:

1. **Impact multiple packages or the entire system**
   - Example: Choosing a new state management library
   - Example: Changing the authentication strategy

2. **Deviate from established architecture constraints**
   - Example: Adding a new package type not in `docs/architecture.md`
   - Example: Using a different database than specified

3. **Introduce new external dependencies or services**
   - Example: Adding a payment provider
   - Example: Integrating with a third-party API

4. **Change fundamental patterns or principles**
   - Example: Moving from hexagonal to layered architecture
   - Example: Switching from REST to GraphQL

5. **Have long-term maintenance implications**
   - Example: Choosing between managed vs self-hosted services
   - Example: Database migration strategies

6. **Involve significant trade-offs**
   - Example: Performance vs maintainability decisions
   - Example: Build-time vs runtime optimization choices

## What Does NOT Require an ADR?

- Small refactorings within a single file/component
- Bug fixes that don't change architecture
- UI/UX changes that don't affect technical architecture
- Dependency version updates (unless changing major versions with breaking changes)
- Adding new features that follow existing patterns

## Naming Convention

ADRs are numbered sequentially and use kebab-case:

```
000-use-architecture-decision-records.md
001-choose-hono-for-api-framework.md
002-implement-hexagonal-architecture.md
003-migrate-from-lucia-to-clerk.md
```

**Format**: `NNN-title-in-kebab-case.md`
- `NNN`: Zero-padded 3-digit number (000, 001, 002, ...)
- `title`: Brief, descriptive title (2-6 words)

## Process

### 1. Before Making a Significant Decision

1. Check if an ADR exists for this topic (search this directory)
2. Review `docs/architecture.md` for existing constraints
3. If deviating from architecture.md, prepare justification

### 2. Creating an ADR

1. Copy `template.md` to new file with next available number
2. Fill in all sections (see template for guidance)
3. Include date and status (Proposed, Accepted, Deprecated, Superseded)
4. List alternatives considered and why they were rejected

### 3. Review and Approval

1. Create a pull request with the ADR
2. ADR must be reviewed before implementation begins
3. Once approved, update status to "Accepted"
4. Implement the decision

### 4. Updating ADRs

- **Never delete** ADRs - they are historical records
- To change a decision: Create a new ADR that supersedes the old one
- Update the old ADR's status to "Superseded by ADR-XXX"
- Link related ADRs in the "Related" section

## ADR Template

See `template.md` for the standard ADR format.

## Quick Reference

| Status | Meaning |
|--------|---------|
| **Proposed** | Decision under consideration, not yet approved |
| **Accepted** | Decision approved and being implemented |
| **Implemented** | Decision fully implemented and in use |
| **Deprecated** | Decision no longer recommended but still in use |
| **Superseded** | Decision replaced by a newer ADR (link to new ADR) |
| **Rejected** | Decision proposed but not approved |

## Index of ADRs

<!-- Maintain this index manually or generate it -->

| # | Title | Status | Date |
|---|-------|--------|------|
| [000](000-use-architecture-decision-records.md) | Use Architecture Decision Records | Accepted | 2025-11-08 |
| [001](001-shadcn-ui-design-system-with-vite.md) | Use shadcn/ui Design System with Vite | Implemented | 2025-11-08 |
| [003](003-rbac-implementation.md) | Custom RBAC Implementation | Implemented | 2025-11-08 |
| [004](004-hibp-integration.md) | HIBP k-Anonymity Password Breach Detection | Implemented | 2025-11-08 |
| [005](005-use-tanstack-form-for-react-forms.md) | Use TanStack Form for React Forms | Implemented | 2025-11-11 |

## Tools

### Finding ADRs

```bash
# List all ADRs
ls docs/adr/*.md

# Search for ADRs about a topic
grep -l "authentication" docs/adr/*.md

# View most recent ADRs
ls -lt docs/adr/*.md | head -5
```

### Creating a New ADR

```bash
# Find next available number
NEXT_NUM=$(printf "%03d" $(($(ls docs/adr/*.md 2>/dev/null | grep -o '[0-9]\{3\}' | sort -n | tail -1) + 1)))

# Copy template
cp docs/adr/template.md "docs/adr/${NEXT_NUM}-your-decision-title.md"

# Edit the new ADR
code "docs/adr/${NEXT_NUM}-your-decision-title.md"
```

## References

- [Michael Nygard's ADR concept](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub organization](https://adr.github.io/)
- [When to Write an ADR](https://github.com/joelparkerhenderson/architecture-decision-record#when-to-write-an-adr)
