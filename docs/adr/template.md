# ADR-XXX: [Title - Short, Descriptive Phrase]

**Status**: [Proposed | Accepted | Implemented | Deprecated | Superseded | Rejected]

**Date**: YYYY-MM-DD

**Deciders**: [List people involved in the decision]

**Related ADRs**:

- Supersedes: [ADR-XXX](XXX-title.md) _(if applicable)_
- Superseded by: [ADR-XXX](XXX-title.md) _(if applicable)_
- Related to: [ADR-XXX](XXX-title.md) _(if applicable)_

---

## Context and Problem Statement

_Describe the context and problem that needs to be solved. What forces are at play? What are the constraints?_

Example:

> We need to choose an authentication provider for the platform. The system must support:
>
> - Multi-tenant company accounts
> - Invite-only signup with company invite codes
> - French and English language support
> - GDPR compliance for EU users
>
> The team has limited time and wants to avoid building auth from scratch for the MVP.

## Decision Drivers

_What are the key factors influencing this decision?_

- Driver 1: [e.g., Time to market - need MVP in 8 weeks]
- Driver 2: [e.g., Budget constraints - limited funds for SaaS]
- Driver 3: [e.g., Security requirements - GDPR compliance mandatory]
- Driver 4: [e.g., Developer experience - team familiar with X]
- Driver 5: [e.g., Scalability - must support 10k+ users]

## Considered Options

### Option 1: [Name of Option]

**Description**: [Brief description of this approach]

**Pros**:

- Pro 1: [Advantage]
- Pro 2: [Advantage]
- Pro 3: [Advantage]

**Cons**:

- Con 1: [Disadvantage]
- Con 2: [Disadvantage]
- Con 3: [Disadvantage]

**Estimated Effort**: [Low | Medium | High]

**Cost**: [Free | $X/month | One-time $X]

---

### Option 2: [Name of Option]

**Description**: [Brief description of this approach]

**Pros**:

- Pro 1: [Advantage]
- Pro 2: [Advantage]

**Cons**:

- Con 1: [Disadvantage]
- Con 2: [Disadvantage]

**Estimated Effort**: [Low | Medium | High]

**Cost**: [Free | $X/month | One-time $X]

---

### Option 3: [Name of Option]

_(Repeat structure as above)_

---

## Decision Outcome

**Chosen Option**: [Option X - Name]

**Rationale**:

_Explain why this option was selected over the alternatives. Address the decision drivers._

Example:

> We chose Lucia Auth for the MVP because:
>
> 1. It's free and self-hosted, meeting our budget constraints
> 2. TypeScript-first design matches our tech stack
> 3. We can migrate to Clerk later without rewriting business logic (hexagonal architecture)
> 4. Team can implement it in <1 week vs 3+ weeks for custom auth
>
> We will revisit this decision when we reach 1000+ MAU and need advanced features like SSO.

## Implementation Notes

_Provide guidance for implementing this decision._

**Migration Path** _(if applicable)_:

- Step 1: [Action]
- Step 2: [Action]
- Step 3: [Action]

**Affected Packages**:

- `packages/api`: [What changes]
- `packages/domain`: [What changes]
- `packages/frontend`: [What changes]

**Configuration Required**:

```typescript
// Example configuration
export const authConfig = {
  provider: 'lucia',
  sessionDuration: 7 * 24 * 60 * 60, // 7 days
};
```

**Testing Requirements**:

- [ ] Unit tests for auth adapter
- [ ] Integration tests for login/logout flow
- [ ] E2E tests for multi-tenant isolation

**Documentation Updates**:

- [ ] Update `docs/architecture.md` if needed
- [ ] Update API documentation
- [ ] Add setup guide for new developers

## Consequences

### Positive Consequences

- Consequence 1: [Benefit we gain]
- Consequence 2: [Benefit we gain]

### Negative Consequences

- Consequence 1: [Trade-off or limitation]
- Consequence 2: [Trade-off or limitation]

### Neutral Consequences

- Consequence 1: [Neither clearly good nor bad]

## Review Schedule

_When should we revisit this decision?_

**Trigger Events**:

- When user count exceeds [threshold]
- When feature X is needed
- After [time period] in production

**Next Review Date**: YYYY-MM-DD _(or "When we reach 1000 MAU")_

## References

_Links to relevant documentation, articles, benchmarks, etc._

- [Link to external resource](https://example.com)
- [Link to spike/POC](../spikes/auth-comparison.md)
- [Link to discussion](https://github.com/org/repo/discussions/123)

---

## Change Log

| Date       | Change                     | Author |
| ---------- | -------------------------- | ------ |
| YYYY-MM-DD | Created initial ADR        | [Name] |
| YYYY-MM-DD | Updated status to Accepted | [Name] |
| YYYY-MM-DD | Marked as Implemented      | [Name] |
