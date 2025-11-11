# ADR-005: Use TanStack Form for React Forms

**Status**: Implemented

**Date**: 2025-11-11

**Deciders**: Development Team

**Related ADRs**:
- Related to: [ADR-001](001-shadcn-ui-design-system-with-vite.md) - Design system integration

---

## Context and Problem Statement

The frontend application requires a robust form management solution to handle user authentication (login, registration) and future feature forms. We need a solution that provides:

- Type-safe form handling with TypeScript
- Client-side validation with clear error messaging
- Integration with Zod schemas (already used for validation in `@es-mono/shared`)
- Testability with data-testid attributes
- Consistent patterns across all forms
- Good developer experience and maintainability

Without a standardized form library, developers might use different approaches (native React state, various form libraries), leading to inconsistent patterns and harder maintenance.

## Decision Drivers

- **Type Safety**: Strong TypeScript support is mandatory for catching errors at compile time
- **Validation Integration**: Must integrate seamlessly with existing Zod schemas
- **Developer Experience**: Should be intuitive and reduce boilerplate
- **Testing Support**: Forms must be easily testable with Playwright e2e tests
- **Bundle Size**: Should not significantly increase bundle size
- **Consistency**: Single pattern across all forms simplifies onboarding and maintenance
- **Performance**: Should handle form validation without unnecessary re-renders

## Considered Options

### Option 1: TanStack Form (@tanstack/react-form)

**Description**: Modern React form library from the TanStack ecosystem, designed for TypeScript-first development with flexible validation.

**Pros**:
- Excellent TypeScript support with full type inference
- Framework-agnostic validation (works with Zod, Yup, or custom validators)
- Granular field-level re-renders for optimal performance
- Clean API with `form.Field` component pattern
- Support for `onChange` and `onSubmit` validation timing
- Small bundle size (~10KB gzipped)
- Active maintenance from TanStack ecosystem
- Compatible with TanStack Router (already in use)

**Cons**:
- Newer library with smaller community than React Hook Form
- Fewer third-party integrations and examples
- Documentation still evolving

**Estimated Effort**: Low (already implemented in auth forms)

**Cost**: Free (open source, MIT license)

---

### Option 2: React Hook Form

**Description**: Popular React form library with hook-based API and wide adoption.

**Pros**:
- Large community and extensive documentation
- Many third-party integrations (UI libraries, validation libraries)
- Mature and battle-tested in production
- Good performance with uncontrolled components
- Built-in validation support

**Cons**:
- TypeScript support is good but not as seamless as TanStack Form
- Hook-based API can be less intuitive for complex forms
- Validation patterns less flexible (harder to do both onChange and onSubmit)
- Slightly larger bundle size (~15KB gzipped)

**Estimated Effort**: Medium (would require migration from current implementation)

**Cost**: Free (open source, MIT license)

---

### Option 3: Formik

**Description**: Veteran React form library, widely used before hooks era.

**Pros**:
- Mature and stable
- Large community
- Comprehensive documentation

**Cons**:
- Maintenance has slowed (fewer updates)
- Component-based API feels dated compared to hooks
- TypeScript support is adequate but not exceptional
- Larger bundle size (~20KB gzipped)
- Performance issues with large forms

**Estimated Effort**: Medium

**Cost**: Free (open source, Apache 2.0)

---

### Option 4: Native React State

**Description**: Handle forms with `useState` and event handlers without a library.

**Pros**:
- No external dependency
- Full control over implementation
- Zero bundle size overhead

**Cons**:
- Significant boilerplate for validation, error handling, submit logic
- Prone to inconsistent patterns across different forms
- Hard to enforce standards (onChange vs onSubmit validation)
- More code to test and maintain
- Re-inventing common form patterns

**Estimated Effort**: High (more code per form)

**Cost**: Free

---

## Decision Outcome

**Chosen Option**: Option 1 - TanStack Form (@tanstack/react-form)

**Rationale**:

We chose TanStack Form because:

1. **TypeScript Excellence**: Best-in-class TypeScript support with full type inference makes forms type-safe by default
2. **Zod Integration**: Seamlessly works with our existing Zod schemas in `@es-mono/shared`, allowing validation logic reuse
3. **Consistent Patterns**: The `form.Field` component pattern creates consistent, readable form code across the application
4. **Validation Flexibility**: Supports both `onChange` (real-time) and `onSubmit` (on-submit) validation, which is essential for good UX (show errors after user interacts, not immediately)
5. **TanStack Ecosystem**: Already using TanStack Router, so staying in the same ecosystem provides better integration and consistency
6. **Performance**: Granular field-level rendering prevents unnecessary re-renders
7. **Already Implemented**: Auth forms (login, register) already use this pattern successfully

The combination of type safety, validation flexibility, and ecosystem alignment makes TanStack Form the best choice for our needs. The smaller community is acceptable given the excellent documentation and our team's ability to work with newer libraries.

## Implementation Notes

### Standard Pattern

All forms MUST follow this pattern:

```typescript
import { useForm } from '@tanstack/react-form';
import { myFormSchema } from '@es-mono/shared';

function MyForm() {
  const form = useForm({
    defaultValues: {
      field1: '',
      field2: '',
    },
    onSubmit: async ({ value }) => {
      // Handle form submission
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field
        name="field1"
        validators={{
          onChange: ({ value }) => {
            const result = myFormSchema.shape.field1.safeParse(value);
            return result.success ? undefined : result.error.issues[0]?.message;
          },
          onSubmit: ({ value }) => {
            const result = myFormSchema.shape.field1.safeParse(value);
            return result.success ? undefined : result.error.issues[0]?.message;
          },
        }}
      >
        {(field) => (
          <div>
            <Input
              data-testid="field1-input"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors?.[0] && (
              <p className="text-destructive">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>
    </form>
  );
}
```

### Affected Packages

- **`packages/frontend`**: All React forms use TanStack Form
- **`packages/shared`**: Zod schemas provide validation logic
- **`packages/design-system`**: Form components (Input, Label, etc.) work with TanStack Form

### Testing Requirements

- [x] Unit tests for form validation logic
- [x] Integration tests for form submission
- [x] E2E tests with data-testid attributes
  - [x] Login form e2e tests (10 tests)
  - [x] Register form e2e tests (7 tests)

### Documentation Updates

- [x] Constitution updated with form library requirement
- [x] Examples in auth forms (login.tsx, register.tsx)
- [ ] Form development guide (future enhancement)

## Consequences

### Positive Consequences

- **Consistent Patterns**: All forms follow the same structure, reducing cognitive load
- **Type Safety**: TypeScript catches form-related errors at compile time
- **Better UX**: Dual validation (onChange + onSubmit) provides optimal user experience
- **Easy Testing**: data-testid attributes make e2e tests reliable
- **Maintainability**: Single pattern simplifies code reviews and refactoring
- **Performance**: Granular re-renders prevent performance issues with complex forms

### Negative Consequences

- **Learning Curve**: Developers unfamiliar with TanStack Form need to learn the pattern
- **Smaller Community**: Fewer Stack Overflow answers and third-party examples
- **Migration Effort**: Future migration to another library would require refactoring all forms

### Neutral Consequences

- **Dependency**: Adds one more dependency to the frontend bundle (~10KB)
- **TanStack Ecosystem Lock-in**: Staying in TanStack ecosystem limits flexibility

## Review Schedule

**Trigger Events**:
- When TanStack Form reaches 1.0.0 stable (currently in beta)
- If TanStack Form development stalls or is abandoned
- When we need features not supported by TanStack Form
- If bundle size becomes a critical concern

**Next Review Date**: 2026-11-11 (1 year) or when any trigger event occurs

## References

- [TanStack Form Documentation](https://tanstack.com/form/latest)
- [TanStack Form with Zod Example](https://tanstack.com/form/latest/docs/framework/react/guides/validation#adapter-based-validation-zod)
- [React Hook Form Comparison](https://tanstack.com/form/latest/docs/comparison)
- Implementation examples:
  - `packages/frontend/src/routes/auth/login.tsx`
  - `packages/frontend/src/routes/auth/register.tsx`
- E2E test suites:
  - `tests/e2e/tests/auth/login.spec.ts`
  - `tests/e2e/tests/auth/register.spec.ts`

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-11 | Created ADR documenting TanStack Form decision | Claude |
| 2025-11-11 | Marked as Implemented (already in use) | Claude |
