# ADR-003: RBAC Implementation - Custom vs CASL

**Date**: 2025-11-08
**Status**: ACCEPTED
**Context**: FR-011 requires granular permission checks on all operations. User-Role-Permission model enables role-based access control with company context.

## Problem Statement

SkillSwap requires role-based access control (RBAC) with:
- Multiple roles (talent, talent_manager, company-specific custom roles)
- Granular permissions (view_talent_pool, create_skill_need, approve_mission, etc.)
- Company context (different roles in different companies)
- Resource-level authorization (user can only modify their own missions)

We evaluated two main approaches for implementing RBAC in the TypeScript stack.

## Options Evaluated

### Option A: CASL (Isomorphic Authorization)
- **TypeScript Support**: Excellent (first-class)
- **Complexity**: Low-medium (define abilities declaratively)
- **Flexibility**: High (field-level permissions, conditions)
- **Bundle Size**: ~10KB minified
- **Adoption**: 3.5k GitHub stars, widely used
- **Pros**:
  - Isomorphic (same rules on frontend/backend)
  - Intuitive DSL for permissions
  - Built-in support for attribute-based access control (ABAC)
  - Easy to test and debug
- **Cons**:
  - Learning curve for advanced features
  - Overkill for simple MVP RBAC needs
  - Additional dependency

### Option B: Custom Implementation
- **TypeScript Support**: Native (fully typed)
- **Complexity**: Low (simple role-permission checks)
- **Flexibility**: Medium (grows with requirements)
- **Bundle Size**: 0KB additional
- **Pros**:
  - Zero dependencies
  - Full control over implementation
  - Fully typed with TypeScript enums
  - Simple for MVP scale (few roles, ~10 permissions)
- **Cons**:
  - Manual validation of transitions
  - Limited built-in features (no ABAC)
  - Reinventing wheel (may miss edge cases)

## Decision

**Use Custom RBAC implementation for MVP, with migration path to CASL if complexity grows.**

### Rationale

1. **YAGNI Principle**: MVP needs simple role-permission checks (~5-10 permissions), not complex policies
2. **Type Safety**: TypeScript enums + interfaces provide full type safety without library DSL
3. **Zero Dependencies**: Aligns with Constitution Principle V (simplicity)
4. **Performance**: No abstraction overhead for MVP scale (10 companies, 100 users)
5. **Migration Path**: If RBAC requirements grow (conditional permissions, field-level access), CASL provides clear upgrade path

### Evaluation Trigger

If any of these conditions occur, migrate to CASL:
- Permission rules exceed 20 distinct permissions
- Need for attribute-based access control (ABAC) with conditions
- Resource-level permissions become complex (e.g., "user can only see missions they're part of")
- Team requests more flexible permission DSL

## Implementation

### Data Model

```typescript
// packages/database/src/schema/roles.ts
export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),           // 'talent', 'talent_manager'
  scope: text('scope').notNull().default('system'), // 'system' or 'company'
  companyId: text('company_id'),
  // ... other fields
});

export const permissions = sqliteTable('permissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),  // 'view_talent_pool'
  resource: text('resource').notNull(),   // 'talent_pool'
  action: text('action').notNull(),       // 'view'
  // ... other fields
});

export const rolePermissions = sqliteTable('role_permissions', {
  roleId: text('role_id').notNull(),
  permissionId: text('permission_id').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}));
```

### Use Case Layer

```typescript
// packages/domain/src/use-cases/CheckPermission.ts
export interface PermissionCheck {
  userId: string;
  permission: string;           // e.g., 'view_talent_pool'
  companyId?: string;           // for company-scoped permissions
  resourceId?: string;          // for resource-level checks
}

export async function checkUserPermission(
  check: PermissionCheck,
  userRepository: UserRepository,
  roleRepository: RoleRepository,
  permissionRepository: PermissionRepository,
): Promise<boolean> {
  const user = await userRepository.findById(check.userId);
  if (!user) return false;

  const companyId = check.companyId || user.companyId;
  const userRoles = await roleRepository.findByUserId(user.id, companyId);

  for (const role of userRoles) {
    const rolePermissions = await permissionRepository.findByRoleId(role.id);
    if (rolePermissions.some(p => p.name === check.permission)) {
      return true;
    }
  }

  return false;
}
```

### API Middleware Layer

```typescript
// packages/api/src/middleware/permissions.ts
export const requirePermission = (permission: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const hasPermission = await checkUserPermission({
      userId: user.id,
      permission,
      companyId: user.companyId,
    }, repositories);

    if (!hasPermission) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await next();
  };
};
```

### Usage in Routes

```typescript
// packages/api/src/adapters/http/routes/companies.ts
const companiesRouter = new Hono()
  .post('/', requirePermission('create_company'), createCompanyController)
  .get('/:id', requirePermission('view_company'), getCompanyController)
  .patch('/:id', requirePermission('update_company'), updateCompanyController);
```

## Consequences

### Positive
- ✅ Simple, testable, fully typed implementation
- ✅ No external dependencies for MVP
- ✅ Clear migration path to CASL if needed
- ✅ Performance overhead minimal (<1ms per permission check)

### Negative
- ⚠️ No built-in ABAC support (must implement manually if needed)
- ⚠️ Manual permission validation (more boilerplate than CASL DSL)

## Migration to CASL (Future)

If/when complexity grows:
1. Keep current permission model (roles, permissions, rolePermissions tables)
2. Wrap CASL on top: Map database permissions to CASL abilities
3. Update middleware layer, keep repository layer unchanged
4. Gradual migration (migrate routes one at a time)

## References

- Research.md Topic 2: RBAC Library for Permission Enforcement
- [CASL Documentation](https://casl.js.org/)
- [Hexagonal Architecture Pattern](../architecture.md)
- Constitution Principle V: Simplicity & YAGNI
