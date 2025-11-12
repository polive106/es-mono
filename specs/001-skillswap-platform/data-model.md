# Data Model: SkillSwap Platform

**Feature**: SkillSwap Platform
**Date**: 2025-11-08
**Phase**: 1 (Design & Contracts)
**Database**: SQLite (MVP) → PostgreSQL (production)
**ORM**: Drizzle ORM

This document defines the complete data model for the SkillSwap platform, including entity schemas, relationships, validation rules, and state transitions.

---

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Company   │────────<│     User     │>───────<│   UserRole   │
└─────────────┘         └──────────────┘         └──────────────┘
      │                        │                          │
      │                        │                          │
      │                        │                  ┌───────────────┐
      │                        │                  │      Role     │
      │                        │                  └───────────────┘
      │                        │                          │
      │                        │                          │
      │                ┌───────────────┐          ┌───────────────┐
      │                │   UserSkill   │<────────>│     Skill     │
      │                └───────────────┘          └───────────────┘
      │                        │
      │                        │
      │                ┌───────────────────┐
      │                │ TalentAvailability │
      │                └───────────────────┘
      │
      │                ┌──────────────┐
      ├───────────────>│  SkillNeed   │
      │                └──────────────┘
      │
      │                ┌──────────────┐
      └───────────────>│   Mission    │────────<┐
                       └──────────────┘         │
                               │                │
                               │                │
                       ┌───────────────┐ ┌──────────────┐
                       │   Approval    │ │     NDA      │
                       └───────────────┘ └──────────────┘

      ┌─────────────┐
      │   Company   │────────>┌──────────────────────┐
      └─────────────┘         │  CreditTransaction   │
                              └──────────────────────┘
```

---

## Core Identity & Access Entities

### Entity: User (or Account)

**Purpose**: Represents a person in the system. A user can be talent, talent manager, or both simultaneously. Users can have different roles in different companies (multi-tenant support).

**Table Name**: `users`

#### Fields

| Field              | Type                  | Constraints                 | Description                                          |
| ------------------ | --------------------- | --------------------------- | ---------------------------------------------------- |
| `id`               | `TEXT` (UUID)         | `PRIMARY KEY`               | Unique user identifier                               |
| `email`            | `TEXT`                | `UNIQUE`, `NOT NULL`        | User email (login credential)                        |
| `password_hash`    | `TEXT`                | `NOT NULL`                  | Bcrypt hash (12+ chars plain, breach checked FR-040) |
| `name`             | `TEXT`                | `NOT NULL`                  | Full name                                            |
| `language_pref`    | `TEXT`                | `NOT NULL`, `DEFAULT 'en'`  | 'en' or 'fr' (FR-003)                                |
| `company_id`       | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY`   | Employer company                                     |
| `last_activity_at` | `INTEGER` (timestamp) | `NOT NULL`                  | Last login/action (for FR-044 3-year retention)      |
| `is_anonymized`    | `BOOLEAN`             | `NOT NULL`, `DEFAULT false` | Anonymized after 3 years (FR-044)                    |
| `anonymized_at`    | `INTEGER` (timestamp) | `NULL`                      | When anonymization occurred                          |
| `created_at`       | `INTEGER` (timestamp) | `NOT NULL`                  | Account creation timestamp                           |
| `updated_at`       | `INTEGER` (timestamp) | `NOT NULL`                  | Last profile update                                  |

#### Relationships

- **Company**: `N:1` (many users belong to one company) - `company_id → companies.id`
- **UserRole**: `1:N` (user has many role assignments) - `id ← user_roles.user_id`
- **UserSkill**: `1:N` (user has many skills) - `id ← user_skills.user_id`
- **TalentAvailability**: `1:1` (user has one availability record) - `id ← talent_availability.user_id`
- **Mission** (as talent): `1:N` - `id ← missions.talent_user_id`
- **Session**: `1:N` - `id ← sessions.user_id`

#### Validation Rules

- Email: Valid format (RFC 5322), max 255 chars
- Password: Min 12 chars (plain), checked against HIBP breach database (FR-040)
- Language: Enum `['en', 'fr']`
- Name: Min 2 chars, max 100 chars

#### Drizzle Schema

```typescript
// packages/database/src/schema/users.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { companies } from './companies';

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  languagePref: text('language_pref', { enum: ['en', 'fr'] })
    .notNull()
    .default('en'),
  companyId: text('company_id')
    .notNull()
    .references(() => companies.id),
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }).notNull(),
  isAnonymized: integer('is_anonymized', { mode: 'boolean' })
    .notNull()
    .default(false),
  anonymizedAt: integer('anonymized_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

---

### Entity: Role

**Purpose**: Represents a permission set that can be assigned to users. Roles can be system-level (default: talent, talent_manager) or company-specific (custom roles).

**Table Name**: `roles`

#### Fields

| Field         | Type                  | Constraints                    | Description                                                   |
| ------------- | --------------------- | ------------------------------ | ------------------------------------------------------------- |
| `id`          | `TEXT` (UUID)         | `PRIMARY KEY`                  | Unique role identifier                                        |
| `name`        | `TEXT`                | `NOT NULL`                     | Role name (e.g., "talent", "talent_manager", "company_admin") |
| `description` | `TEXT`                | `NULL`                         | Human-readable description                                    |
| `scope`       | `TEXT`                | `NOT NULL`, `DEFAULT 'system'` | 'system' or 'company' (FR-009)                                |
| `company_id`  | `TEXT` (UUID)         | `NULL`, `FOREIGN KEY`          | NULL for system roles, company ID for custom roles            |
| `created_at`  | `INTEGER` (timestamp) | `NOT NULL`                     | Role creation timestamp                                       |

#### Relationships

- **Company**: `N:1` (custom roles belong to one company) - `company_id → companies.id`
- **RolePermission**: `1:N` (role has many permissions) - `id ← role_permissions.role_id`
- **UserRole**: `1:N` (role assigned to many users) - `id ← user_roles.role_id`

#### Validation Rules

- Name: Min 2 chars, max 50 chars, lowercase with underscores
- Scope: Enum `['system', 'company']`
- Company ID: Required if scope = 'company', NULL if scope = 'system'

#### Default System Roles

| Name             | Description                                         | Scope  |
| ---------------- | --------------------------------------------------- | ------ |
| `talent`         | Can participate in missions (FR-007)                | system |
| `talent_manager` | Can create skill needs and manage missions (FR-007) | system |

#### Drizzle Schema

```typescript
// packages/database/src/schema/users.ts (continued)
export const roles = sqliteTable('roles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  scope: text('scope', { enum: ['system', 'company'] })
    .notNull()
    .default('system'),
  companyId: text('company_id').references(() => companies.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

---

### Entity: Permission

**Purpose**: Represents a specific capability in the system (e.g., "view_talent_pool", "create_skill_need"). Permissions are granular and combined into roles (FR-010).

**Table Name**: `permissions`

#### Fields

| Field         | Type                  | Constraints          | Description                                                  |
| ------------- | --------------------- | -------------------- | ------------------------------------------------------------ |
| `id`          | `TEXT` (UUID)         | `PRIMARY KEY`        | Unique permission identifier                                 |
| `name`        | `TEXT`                | `UNIQUE`, `NOT NULL` | Permission name (e.g., "view_talent_pool")                   |
| `resource`    | `TEXT`                | `NOT NULL`           | Resource type (e.g., "talent_pool", "skill_need", "mission") |
| `action`      | `TEXT`                | `NOT NULL`           | Action type (e.g., "view", "create", "update", "delete")     |
| `description` | `TEXT`                | `NULL`               | Human-readable description                                   |
| `created_at`  | `INTEGER` (timestamp) | `NOT NULL`           | Permission creation timestamp                                |

#### Relationships

- **RolePermission**: `1:N` (permission assigned to many roles) - `id ← role_permissions.permission_id`

#### Validation Rules

- Name: Lowercase with underscores, format: `{action}_{resource}` (e.g., "create_skill_need")
- Resource: Max 50 chars
- Action: Enum `['view', 'create', 'update', 'delete', 'approve']`

#### Default System Permissions

| Name                | Resource    | Action  | Description             |
| ------------------- | ----------- | ------- | ----------------------- |
| `view_talent_pool`  | talent_pool | view    | Search available talent |
| `create_skill_need` | skill_need  | create  | Post skill requirements |
| `create_mission`    | mission     | create  | Propose mission         |
| `approve_mission`   | mission     | approve | Manager approval        |
| `purchase_credits`  | credits     | create  | Buy credit packages     |

#### Drizzle Schema

```typescript
export const permissions = sqliteTable('permissions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  resource: text('resource').notNull(),
  action: text('action', {
    enum: ['view', 'create', 'update', 'delete', 'approve'],
  }).notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

---

### Entity: UserRole (Junction Table)

**Purpose**: Links Users to Roles within a Company context. Enables multi-tenancy: users can have different roles in different companies (FR-012).

**Table Name**: `user_roles`

#### Fields

| Field         | Type                  | Constraints               | Description                              |
| ------------- | --------------------- | ------------------------- | ---------------------------------------- |
| `id`          | `TEXT` (UUID)         | `PRIMARY KEY`             | Unique assignment identifier             |
| `user_id`     | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY` | User receiving role                      |
| `role_id`     | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY` | Role being assigned                      |
| `company_id`  | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY` | Company context for this role assignment |
| `assigned_at` | `INTEGER` (timestamp) | `NOT NULL`                | When role was assigned                   |

#### Relationships

- **User**: `N:1` - `user_id → users.id`
- **Role**: `N:1` - `role_id → roles.id`
- **Company**: `N:1` - `company_id → companies.id`

#### Unique Constraint

- `UNIQUE (user_id, role_id, company_id)` - Prevent duplicate role assignments

#### Validation Rules

- Company ID must match user's employer OR user must have permission to operate in multiple companies (future feature)

#### Drizzle Schema

```typescript
export const userRoles = sqliteTable(
  'user_roles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id),
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id),
    assignedAt: integer('assigned_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    uniqueUserRoleCompany: unique().on(
      table.userId,
      table.roleId,
      table.companyId
    ),
  })
);
```

---

### Entity: RolePermission (Junction Table)

**Purpose**: N:N relationship between Roles and Permissions. Allows flexible permission assignment to roles.

**Table Name**: `role_permissions`

#### Fields

| Field           | Type          | Constraints                                          | Description |
| --------------- | ------------- | ---------------------------------------------------- | ----------- |
| `role_id`       | `TEXT` (UUID) | `NOT NULL`, `FOREIGN KEY`, `PRIMARY KEY` (composite) | Role        |
| `permission_id` | `TEXT` (UUID) | `NOT NULL`, `FOREIGN KEY`, `PRIMARY KEY` (composite) | Permission  |

#### Relationships

- **Role**: `N:1` - `role_id → roles.id`
- **Permission**: `N:1` - `permission_id → permissions.id`

#### Drizzle Schema

```typescript
export const rolePermissions = sqliteTable(
  'role_permissions',
  {
    roleId: text('role_id')
      .notNull()
      .references(() => roles.id),
    permissionId: text('permission_id')
      .notNull()
      .references(() => permissions.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  })
);
```

---

## Business Entities

### Entity: Company

**Purpose**: Represents an organization in the SkillSwap network. Companies onboard via invite (FR-001) and participate in missions.

**Table Name**: `companies`

#### Fields

| Field            | Type                  | Constraints             | Description                                     |
| ---------------- | --------------------- | ----------------------- | ----------------------------------------------- |
| `id`             | `TEXT` (UUID)         | `PRIMARY KEY`           | Unique company identifier                       |
| `name`           | `TEXT`                | `NOT NULL`, `UNIQUE`    | Company name                                    |
| `industry`       | `TEXT`                | `NOT NULL`              | Industry sector (e.g., "healthtech", "fintech") |
| `size`           | `TEXT`                | `NOT NULL`              | Company size (e.g., "1-10", "11-50", "51-200")  |
| `location`       | `TEXT`                | `NOT NULL`              | Geographic location (FR-002: FR/UK)             |
| `invite_code`    | `TEXT`                | `UNIQUE`, `NOT NULL`    | Unique code for employee invites (FR-001)       |
| `credit_balance` | `INTEGER`             | `NOT NULL`, `DEFAULT 0` | Current credit balance (can go negative FR-027) |
| `created_at`     | `INTEGER` (timestamp) | `NOT NULL`              | Company creation timestamp                      |
| `updated_at`     | `INTEGER` (timestamp) | `NOT NULL`              | Last profile update                             |

#### Relationships

- **User**: `1:N` (company has many employees) - `id ← users.company_id`
- **SkillNeed**: `1:N` (company posts many skill needs) - `id ← skill_needs.company_id`
- **Mission** (proposing): `1:N` - `id ← missions.proposing_company_id`
- **Mission** (receiving): `1:N` - `id ← missions.receiving_company_id`
- **CreditTransaction**: `1:N` - `id ← credit_transactions.company_id`

#### Validation Rules

- Name: Min 2 chars, max 100 chars
- Industry: Max 50 chars
- Size: Enum `['1-10', '11-50', '51-200', '201-500']` (MVP excludes >500 employees)
- Location: Enum `['FR', 'UK']` (MVP scope)
- Invite Code: 8 alphanumeric chars, auto-generated

#### Drizzle Schema

```typescript
// packages/database/src/schema/companies.ts
export const companies = sqliteTable('companies', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  industry: text('industry').notNull(),
  size: text('size', {
    enum: ['1-10', '11-50', '51-200', '201-500'],
  }).notNull(),
  location: text('location', { enum: ['FR', 'UK'] }).notNull(),
  inviteCode: text('invite_code')
    .notNull()
    .unique()
    .$defaultFn(() => generateInviteCode()),
  creditBalance: integer('credit_balance').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

---

### Entity: Skill

**Purpose**: Represents a capability in the hierarchical taxonomy. Skills are organized in categories (FR-013).

**Table Name**: `skills`

#### Fields

| Field         | Type                  | Constraints                | Description                                                     |
| ------------- | --------------------- | -------------------------- | --------------------------------------------------------------- |
| `id`          | `TEXT` (UUID)         | `PRIMARY KEY`              | Unique skill identifier                                         |
| `name`        | `TEXT`                | `NOT NULL`                 | Skill name (e.g., "JavaScript", "Financial Modeling")           |
| `category`    | `TEXT`                | `NOT NULL`                 | Top-level category (e.g., "Engineering", "Design", "Marketing") |
| `description` | `TEXT`                | `NULL`                     | Detailed description                                            |
| `is_approved` | `BOOLEAN`             | `NOT NULL`, `DEFAULT true` | User-proposed skills pending approval (FR-014)                  |
| `created_at`  | `INTEGER` (timestamp) | `NOT NULL`                 | Skill creation timestamp                                        |

#### Relationships

- **UserSkill**: `1:N` (skill mapped by many users) - `id ← user_skills.skill_id`
- **SkillNeed**: `1:N` (skill requested by many companies) - `id ← skill_needs.skill_id`

#### Validation Rules

- Name: Min 2 chars, max 100 chars
- Category: From ESCO top-level categories (10-15 options, see research.md)
- Is Approved: User-proposed skills default to `false`, admin approval required

#### Drizzle Schema

```typescript
// packages/database/src/schema/skills.ts
export const skills = sqliteTable(
  'skills',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    category: text('category').notNull(),
    description: text('description'),
    isApproved: integer('is_approved', { mode: 'boolean' })
      .notNull()
      .default(true),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    nameIdx: index('idx_skills_name').on(table.name), // For autocomplete search
    categoryIdx: index('idx_skills_category').on(table.category), // For filtering
  })
);
```

---

### Entity: UserSkill (Junction Table)

**Purpose**: Links Users to Skills with proficiency metadata. Represents a user's self-reported skill profile (FR-015).

**Table Name**: `user_skills`

#### Fields

| Field               | Type                  | Constraints               | Description                                      |
| ------------------- | --------------------- | ------------------------- | ------------------------------------------------ |
| `id`                | `TEXT` (UUID)         | `PRIMARY KEY`             | Unique mapping identifier                        |
| `user_id`           | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY` | User with this skill                             |
| `skill_id`          | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY` | Skill possessed                                  |
| `proficiency_level` | `TEXT`                | `NOT NULL`                | 'beginner', 'intermediate', 'advanced', 'expert' |
| `years_experience`  | `INTEGER`             | `NULL`                    | Years of experience with this skill              |
| `created_at`        | `INTEGER` (timestamp) | `NOT NULL`                | When skill was added                             |

#### Relationships

- **User**: `N:1` - `user_id → users.id`
- **Skill**: `N:1` - `skill_id → skills.id`

#### Unique Constraint

- `UNIQUE (user_id, skill_id)` - User can't have duplicate skills

#### Validation Rules

- Proficiency Level: Enum `['beginner', 'intermediate', 'advanced', 'expert']`
- Years Experience: 0-50 (if provided)

#### Drizzle Schema

```typescript
export const userSkills = sqliteTable(
  'user_skills',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    skillId: text('skill_id')
      .notNull()
      .references(() => skills.id),
    proficiencyLevel: text('proficiency_level', {
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    }).notNull(),
    yearsExperience: integer('years_experience'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    uniqueUserSkill: unique().on(table.userId, table.skillId),
    userIdx: index('idx_user_skills_user_id').on(table.userId), // For user profile queries
    skillIdx: index('idx_user_skills_skill_id').on(table.skillId), // For talent search
  })
);
```

---

### Entity: TalentAvailability

**Purpose**: Represents a user's availability for missions. Includes availability percentage and anonymization status (FR-016, FR-017).

**Table Name**: `talent_availability`

#### Fields

| Field              | Type                  | Constraints                         | Description                                   |
| ------------------ | --------------------- | ----------------------------------- | --------------------------------------------- |
| `id`               | `TEXT` (UUID)         | `PRIMARY KEY`                       | Unique availability record identifier         |
| `user_id`          | `TEXT` (UUID)         | `UNIQUE`, `NOT NULL`, `FOREIGN KEY` | User (1:1 relationship)                       |
| `availability_pct` | `INTEGER`             | `NOT NULL`, `DEFAULT 0`             | 0-100 (percentage of capacity, FR-016)        |
| `is_available`     | `BOOLEAN`             | `NOT NULL`, `DEFAULT true`          | User actively seeking missions                |
| `is_anonymized`    | `BOOLEAN`             | `NOT NULL`, `DEFAULT true`          | Profile anonymized in search results (FR-017) |
| `active_from`      | `INTEGER` (timestamp) | `NULL`                              | Availability start date                       |
| `active_until`     | `INTEGER` (timestamp) | `NULL`                              | Availability end date (NULL = indefinite)     |
| `updated_at`       | `INTEGER` (timestamp) | `NOT NULL`                          | Last availability update                      |

#### Relationships

- **User**: `1:1` - `user_id → users.id`

#### Validation Rules

- Availability Pct: 0-100
- Active From/Until: If both provided, `active_until > active_from`

#### Drizzle Schema

```typescript
export const talentAvailability = sqliteTable(
  'talent_availability',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id),
    availabilityPct: integer('availability_pct').notNull().default(0),
    isAvailable: integer('is_available', { mode: 'boolean' })
      .notNull()
      .default(true),
    isAnonymized: integer('is_anonymized', { mode: 'boolean' })
      .notNull()
      .default(true),
    activeFrom: integer('active_from', { mode: 'timestamp' }),
    activeUntil: integer('active_until', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    availabilityIdx: index('idx_talent_availability_pct').on(
      table.availabilityPct
    ), // For search filters
  })
);
```

---

### Entity: SkillNeed

**Purpose**: Represents a company's request for expertise. Posted by talent_manager role (FR-018).

**Table Name**: `skill_needs`

#### Fields

| Field                      | Type                  | Constraints                  | Description                                                 |
| -------------------------- | --------------------- | ---------------------------- | ----------------------------------------------------------- |
| `id`                       | `TEXT` (UUID)         | `PRIMARY KEY`                | Unique skill need identifier                                |
| `company_id`               | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY`    | Requesting company                                          |
| `skill_id`                 | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY`    | Required skill                                              |
| `title`                    | `TEXT`                | `NOT NULL`                   | Need title (e.g., "Financial Regulatory Compliance Expert") |
| `description`              | `TEXT`                | `NOT NULL`                   | Detailed need description                                   |
| `duration_months`          | `INTEGER`             | `NOT NULL`                   | Expected project duration (FR-018: typically 3 months)      |
| `time_commitment_hrs_week` | `INTEGER`             | `NOT NULL`                   | Hours per week needed                                       |
| `status`                   | `TEXT`                | `NOT NULL`, `DEFAULT 'open'` | 'open', 'matched', 'fulfilled', 'cancelled'                 |
| `created_at`               | `INTEGER` (timestamp) | `NOT NULL`                   | Skill need creation timestamp                               |
| `updated_at`               | `INTEGER` (timestamp) | `NOT NULL`                   | Last update timestamp                                       |

#### Relationships

- **Company**: `N:1` - `company_id → companies.id`
- **Skill**: `N:1` - `skill_id → skills.id`
- **Mission**: `1:N` (skill need can have multiple proposals) - `id ← missions.skill_need_id`

#### Validation Rules

- Duration Months: 1-12
- Time Commitment: 1-40 hours/week
- Status: Enum `['open', 'matched', 'fulfilled', 'cancelled']`

#### Drizzle Schema

```typescript
export const skillNeeds = sqliteTable(
  'skill_needs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id),
    skillId: text('skill_id')
      .notNull()
      .references(() => skills.id),
    title: text('title').notNull(),
    description: text('description').notNull(),
    durationMonths: integer('duration_months').notNull(),
    timeCommitmentHrsWeek: integer('time_commitment_hrs_week').notNull(),
    status: text('status', {
      enum: ['open', 'matched', 'fulfilled', 'cancelled'],
    })
      .notNull()
      .default('open'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    companyIdx: index('idx_skill_needs_company_id').on(table.companyId),
    skillIdx: index('idx_skill_needs_skill_id').on(table.skillId),
    statusIdx: index('idx_skill_needs_status').on(table.status), // For listing open needs
  })
);
```

---

## Mission & Transaction Entities

### Entity: Mission

**Purpose**: Represents a talent lending arrangement between companies. **IMPORTANT**: This is NOT an exchange or simultaneous employee swap. A "mission" is when one company lends talent to another company for credits. Companies lend talent for credits, then use those credits asynchronously to borrow talent later. Company A can lend an employee in January (+30 credits), then use those credits in November to borrow from Company C (-30 credits).

**Table Name**: `missions`

#### Fields

| Field                      | Type                  | Constraints               | Description                                                         |
| -------------------------- | --------------------- | ------------------------- | ------------------------------------------------------------------- |
| `id`                       | `TEXT` (UUID)         | `PRIMARY KEY`             | Unique mission identifier                                           |
| `proposing_company_id`     | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY` | Company initiating the proposal (can be lender or borrower)         |
| `receiving_company_id`     | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY` | Company receiving/borrowing the talent                              |
| `talent_user_id`           | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY` | Employee being lent for this mission                                |
| `skill_need_id`            | `TEXT` (UUID)         | `NULL`, `FOREIGN KEY`     | Related skill need (if applicable)                                  |
| `duration_months`          | `INTEGER`             | `NOT NULL`                | Agreed mission duration                                             |
| `time_commitment_hrs_week` | `INTEGER`             | `NOT NULL`                | Agreed hours per week                                               |
| `credit_value`             | `INTEGER`             | `NOT NULL`                | Credit value of mission (FR-028: salary-based or negotiated FR-029) |
| `status`                   | `TEXT`                | `NOT NULL`                | See status enum below                                               |
| `created_at`               | `INTEGER` (timestamp) | `NOT NULL`                | Mission creation timestamp                                          |
| `updated_at`               | `INTEGER` (timestamp) | `NOT NULL`                | Last status update                                                  |

#### Credit Flow Logic

**Lending Company** (company that has the employee):

- **Receives**: `+credit_value` (they provided value by lending their employee)
- **Identified by**: Company that `talent_user_id` belongs to (employee's employer)

**Borrowing Company** (company receiving the talent):

- **Spends**: `-credit_value` (they consumed value by using external talent)
- **Identified by**: `receiving_company_id`

**Example Flows**:

**Flow 1: Borrower Initiates** (most common)

1. Company A (borrower) posts skill need: "Need regulatory expert"
2. Company A searches talent pool, finds Employee X from Company B
3. Company A proposes to borrow Employee X
   - `proposing_company_id` = Company A (initiator)
   - `receiving_company_id` = Company A (borrower)
   - `talent_user_id` = Employee X (from Company B)
4. Approval: Employee X consent → Company B manager → Company A manager → Legal
5. Credits: Company B +30 (lender), Company A -30 (borrower)

**Flow 2: Lender Initiates**

1. Company B has underutilized Employee X with regulatory skills
2. Company B searches skill needs, finds Company A's need
3. Company B proposes Employee X for Company A's need
   - `proposing_company_id` = Company B (initiator)
   - `receiving_company_id` = Company A (borrower)
   - `talent_user_id` = Employee X (from Company B)
4. Same approval workflow
5. Same credit flow: Company B +30, Company A -30

**Flow 3: Employee Self-Proposal** (US7)

1. Employee X browses opportunities, finds Company A's need
2. Employee X proposes themselves
   - Triggers Company B (employer) notification for approval
3. Same credit flow

**Key Insight**: Regardless of who initiates, the company that employs the talent always receives credits, and the company borrowing the talent always spends credits. This enables asynchronous value exchange.

#### Relationships

- **Company** (proposing): `N:1` - `proposing_company_id → companies.id`
- **Company** (receiving/borrowing): `N:1` - `receiving_company_id → companies.id`
- **User** (talent being lent): `N:1` - `talent_user_id → users.id`
- **SkillNeed**: `N:1` - `skill_need_id → skill_needs.id`
- **Approval**: `1:N` (mission has multiple approval steps) - `id ← approvals.mission_id`
- **NDA**: `1:1` (mission has one NDA) - `id ← ndas.mission_id`
- **TimeLog**: `1:N` (mission has many time logs) - `id ← time_logs.mission_id`

#### Status Enum & State Machine

See **State Transitions** section below for detailed state machine.

| Status             | Description                                    |
| ------------------ | ---------------------------------------------- |
| `proposed`         | Initial mission proposal created               |
| `negotiating`      | Counter-proposal in progress (FR-023)          |
| `awaiting_consent` | Awaiting employee consent                      |
| `awaiting_manager` | Awaiting manager approval                      |
| `awaiting_legal`   | Awaiting legal review (NDA)                    |
| `approved`         | All approvals complete, mission ready to start |
| `active`           | Mission in progress                            |
| `completed`        | Mission finished (FR-035)                      |
| `cancelled`        | Mission cancelled (FR-025)                     |

#### Validation Rules

- Duration Months: 1-12
- Time Commitment: 1-40 hours/week
- Credit Value: 1-10000 (reasonable range for MVP)
- Proposing Company ≠ Receiving Company

#### Drizzle Schema

```typescript
// packages/database/src/schema/missions.ts
export const missions = sqliteTable(
  'missions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    proposingCompanyId: text('proposing_company_id')
      .notNull()
      .references(() => companies.id),
    receivingCompanyId: text('receiving_company_id')
      .notNull()
      .references(() => companies.id),
    talentUserId: text('talent_user_id')
      .notNull()
      .references(() => users.id),
    skillNeedId: text('skill_need_id').references(() => skillNeeds.id),
    durationMonths: integer('duration_months').notNull(),
    timeCommitmentHrsWeek: integer('time_commitment_hrs_week').notNull(),
    creditValue: integer('credit_value').notNull(),
    status: text('status', {
      enum: [
        'proposed',
        'negotiating',
        'awaiting_consent',
        'awaiting_manager',
        'awaiting_legal',
        'approved',
        'active',
        'completed',
        'cancelled',
      ],
    })
      .notNull()
      .default('proposed'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    proposingCompanyIdx: index('idx_missions_proposing_company').on(
      table.proposingCompanyId
    ),
    receivingCompanyIdx: index('idx_missions_receiving_company').on(
      table.receivingCompanyId
    ),
    talentIdx: index('idx_missions_talent_user').on(table.talentUserId),
    statusIdx: index('idx_missions_status').on(table.status),
  })
);
```

---

### Entity: Approval

**Purpose**: Represents a step in the approval workflow (FR-022). Each mission has 3 approval records: employee_consent, manager_approval, legal_check.

**Table Name**: `approvals`

#### Fields

| Field              | Type                  | Constraints                     | Description                                           |
| ------------------ | --------------------- | ------------------------------- | ----------------------------------------------------- |
| `id`               | `TEXT` (UUID)         | `PRIMARY KEY`                   | Unique approval identifier                            |
| `mission_id`       | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY`       | Related mission                                       |
| `type`             | `TEXT`                | `NOT NULL`                      | 'employee_consent', 'manager_approval', 'legal_check' |
| `status`           | `TEXT`                | `NOT NULL`, `DEFAULT 'pending'` | 'pending', 'approved', 'rejected'                     |
| `approver_user_id` | `TEXT` (UUID)         | `NULL`, `FOREIGN KEY`           | User who approved/rejected (NULL if pending)          |
| `comments`         | `TEXT`                | `NULL`                          | Approver comments                                     |
| `approved_at`      | `INTEGER` (timestamp) | `NULL`                          | When approval decision was made                       |
| `created_at`       | `INTEGER` (timestamp) | `NOT NULL`                      | Approval request creation timestamp                   |

#### Relationships

- **Mission**: `N:1` - `mission_id → missions.id`
- **User** (approver): `N:1` - `approver_user_id → users.id`

#### Unique Constraint

- `UNIQUE (mission_id, type)` - Each mission has exactly one approval of each type

#### Validation Rules

- Type: Enum `['employee_consent', 'manager_approval', 'legal_check']`
- Status: Enum `['pending', 'approved', 'rejected']`

#### Drizzle Schema

```typescript
export const approvals = sqliteTable(
  'approvals',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    missionId: text('mission_id')
      .notNull()
      .references(() => missions.id),
    type: text('type', {
      enum: ['employee_consent', 'manager_approval', 'legal_check'],
    }).notNull(),
    status: text('status', { enum: ['pending', 'approved', 'rejected'] })
      .notNull()
      .default('pending'),
    approverUserId: text('approver_user_id').references(() => users.id),
    comments: text('comments'),
    approvedAt: integer('approved_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    uniqueMissionType: unique().on(table.missionId, table.type),
    missionIdx: index('idx_approvals_mission_id').on(table.missionId),
  })
);
```

---

### Entity: NDA

**Purpose**: Represents legal agreement for a mission (FR-024). Signed as part of legal approval step.

**Table Name**: `ndas`

#### Fields

| Field                         | Type                  | Constraints                         | Description                              |
| ----------------------------- | --------------------- | ----------------------------------- | ---------------------------------------- |
| `id`                          | `TEXT` (UUID)         | `PRIMARY KEY`                       | Unique NDA identifier                    |
| `mission_id`                  | `TEXT` (UUID)         | `UNIQUE`, `NOT NULL`, `FOREIGN KEY` | Related mission (1:1)                    |
| `proposing_company_signer_id` | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY`           | Signer from proposing company            |
| `receiving_company_signer_id` | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY`           | Signer from receiving company            |
| `document_url`                | `TEXT`                | `NOT NULL`                          | URL to signed NDA document (storage TBD) |
| `signed_at`                   | `INTEGER` (timestamp) | `NOT NULL`                          | When both parties signed                 |
| `created_at`                  | `INTEGER` (timestamp) | `NOT NULL`                          | NDA creation timestamp                   |

#### Relationships

- **Mission**: `1:1` - `mission_id → missions.id`
- **User** (proposing signer): `N:1` - `proposing_company_signer_id → users.id`
- **User** (receiving signer): `N:1` - `receiving_company_signer_id → users.id`

#### Validation Rules

- Document URL: Valid URL format
- Signed At: Must be before mission becomes 'active'

#### Drizzle Schema

```typescript
export const ndas = sqliteTable('ndas', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  missionId: text('mission_id')
    .notNull()
    .unique()
    .references(() => missions.id),
  proposingCompanySignerId: text('proposing_company_signer_id')
    .notNull()
    .references(() => users.id),
  receivingCompanySignerId: text('receiving_company_signer_id')
    .notNull()
    .references(() => users.id),
  documentUrl: text('document_url').notNull(),
  signedAt: integer('signed_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

---

### Entity: TimeLog

**Purpose**: Tracks hours worked during active missions (FR-032).

**Table Name**: `time_logs`

#### Fields

| Field          | Type                  | Constraints               | Description                  |
| -------------- | --------------------- | ------------------------- | ---------------------------- |
| `id`           | `TEXT` (UUID)         | `PRIMARY KEY`             | Unique time log identifier   |
| `mission_id`   | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY` | Related mission              |
| `user_id`      | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY` | User logging time            |
| `hours_worked` | `INTEGER`             | `NOT NULL`                | Hours logged for this entry  |
| `work_date`    | `INTEGER` (timestamp) | `NOT NULL`                | Date of work                 |
| `notes`        | `TEXT`                | `NULL`                    | Work notes (FR-034)          |
| `created_at`   | `INTEGER` (timestamp) | `NOT NULL`                | Log entry creation timestamp |

#### Relationships

- **Mission**: `N:1` - `mission_id → missions.id`
- **User**: `N:1` - `user_id → users.id`

#### Validation Rules

- Hours Worked: 0-24 (per day)
- Work Date: Must be during mission active period

#### Drizzle Schema

```typescript
export const timeLogs = sqliteTable(
  'time_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    missionId: text('mission_id')
      .notNull()
      .references(() => missions.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    hoursWorked: integer('hours_worked').notNull(),
    workDate: integer('work_date', { mode: 'timestamp' }).notNull(),
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    missionIdx: index('idx_time_logs_mission_id').on(table.missionId),
    userIdx: index('idx_time_logs_user_id').on(table.userId),
  })
);
```

---

### Entity: CreditTransaction

**Purpose**: Records credit movements (missions, purchases, adjustments). Enables credit balance auditing (FR-031).

**Table Name**: `credit_transactions`

#### Fields

| Field                  | Type                  | Constraints               | Description                                         |
| ---------------------- | --------------------- | ------------------------- | --------------------------------------------------- |
| `id`                   | `TEXT` (UUID)         | `PRIMARY KEY`             | Unique transaction identifier                       |
| `company_id`           | `TEXT` (UUID)         | `NOT NULL`, `FOREIGN KEY` | Company affected                                    |
| `amount`               | `INTEGER`             | `NOT NULL`                | Credit amount (positive = gained, negative = spent) |
| `type`                 | `TEXT`                | `NOT NULL`                | 'mission', 'purchase', 'adjustment'                 |
| `description`          | `TEXT`                | `NOT NULL`                | Human-readable description                          |
| `mission_id`           | `TEXT` (UUID)         | `NULL`, `FOREIGN KEY`     | Related mission (if type = 'mission')               |
| `initiated_by_user_id` | `TEXT` (UUID)         | `NULL`, `FOREIGN KEY`     | User who initiated transaction                      |
| `created_at`           | `INTEGER` (timestamp) | `NOT NULL`                | Transaction timestamp                               |

#### Relationships

- **Company**: `N:1` - `company_id → companies.id`
- **Mission**: `N:1` - `mission_id → missions.id`
- **User** (initiator): `N:1` - `initiated_by_user_id → users.id`

#### Validation Rules

- Type: Enum `['mission', 'purchase', 'adjustment']`
- Amount: Non-zero integer
- Mission ID: Required if type = 'mission'

#### Drizzle Schema

```typescript
// packages/database/src/schema/credits.ts
export const creditTransactions = sqliteTable(
  'credit_transactions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id),
    amount: integer('amount').notNull(),
    type: text('type', {
      enum: ['mission', 'purchase', 'adjustment'],
    }).notNull(),
    description: text('description').notNull(),
    missionId: text('mission_id').references(() => missions.id),
    initiatedByUserId: text('initiated_by_user_id').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    companyIdx: index('idx_credit_transactions_company_id').on(table.companyId),
    typeIdx: index('idx_credit_transactions_type').on(table.type),
  })
);
```

---

## State Transitions

### Mission Status State Machine

**Purpose**: Enforces valid status transitions for missions (see research.md Topic 7).

```
┌─────────────┐
│  proposed   │──────┐
└─────────────┘      │
       │             │
       │ propose     │ cancel
       ▼             │
┌─────────────┐      │
│ negotiating │──────┤
└─────────────┘      │
       │             │
       │ agree       │
       ▼             │
┌─────────────────┐  │
│ awaiting_consent│──┤
└─────────────────┘  │
       │             │
       │ consent     │
       ▼             │
┌─────────────────┐  │
│ awaiting_manager│──┤
└─────────────────┘  │
       │             │
       │ approve     │
       ▼             │
┌─────────────────┐  │
│ awaiting_legal  │──┤
└─────────────────┘  │
       │             │
       │ sign NDA    │
       ▼             │
┌─────────────┐      │
│  approved   │──────┘
└─────────────┘
       │
       │ activate
       ▼
┌─────────────┐
│   active    │
└─────────────┘
       │
       │ complete
       ▼
┌─────────────┐
│  completed  │
└─────────────┘

┌─────────────┐
│  cancelled  │ (terminal state)
└─────────────┘
```

**Transition Rules** (implemented in domain layer):

```typescript
const VALID_TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
  proposed: ['negotiating', 'cancelled'],
  negotiating: ['awaiting_consent', 'cancelled'],
  awaiting_consent: ['awaiting_manager', 'cancelled'],
  awaiting_manager: ['awaiting_legal', 'cancelled'],
  awaiting_legal: ['approved', 'cancelled'],
  approved: ['active'],
  active: ['completed'],
  completed: [],
  cancelled: [],
};
```

**Side Effects** (business logic):

- `awaiting_consent → awaiting_manager`: Create `Approval` record with `type='employee_consent'`, `status='approved'`
- `awaiting_manager → awaiting_legal`: Create `Approval` record with `type='manager_approval'`, `status='approved'`
- `awaiting_legal → approved`: Create `NDA` record, `Approval` record with `type='legal_check'`, `status='approved'`
- `approved → active`: Credit transaction created (debit receiving company, credit proposing company)
- `active → completed`: Final credit settlement (if any adjustments)

---

## Indexes Summary

**Performance Targets**: SC-018 (<2s skill search), FR-020 (talent search/filter)

| Table                 | Index                                | Columns              | Purpose                     |
| --------------------- | ------------------------------------ | -------------------- | --------------------------- |
| `users`               | `idx_users_company_id`               | company_id           | Filter users by company     |
| `user_skills`         | `idx_user_skills_user_id`            | user_id              | Get user's skills           |
| `user_skills`         | `idx_user_skills_skill_id`           | skill_id             | Find users with skill       |
| `talent_availability` | `idx_talent_availability_pct`        | availability_pct     | Filter by availability      |
| `skills`              | `idx_skills_name`                    | name                 | Autocomplete search         |
| `skills`              | `idx_skills_category`                | category             | Filter by category          |
| `skill_needs`         | `idx_skill_needs_company_id`         | company_id           | Company's needs             |
| `skill_needs`         | `idx_skill_needs_skill_id`           | skill_id             | Needs for specific skill    |
| `skill_needs`         | `idx_skill_needs_status`             | status               | List open needs             |
| `missions`            | `idx_missions_proposing_company`     | proposing_company_id | Company's proposals         |
| `missions`            | `idx_missions_receiving_company`     | receiving_company_id | Company's received          |
| `missions`            | `idx_missions_talent_user`           | talent_user_id       | User's missions             |
| `missions`            | `idx_missions_status`                | status               | Filter by status            |
| `approvals`           | `idx_approvals_mission_id`           | mission_id           | Mission's approvals         |
| `credit_transactions` | `idx_credit_transactions_company_id` | company_id           | Company transaction history |
| `time_logs`           | `idx_time_logs_mission_id`           | mission_id           | Mission time logs           |

---

## Data Seeding

### Seed Data Requirements

1. **System Roles** (2 records):
   - `{ name: 'talent', scope: 'system', description: 'Can participate in missions' }`
   - `{ name: 'talent_manager', scope: 'system', description: 'Can create skill needs and manage missions' }`

2. **System Permissions** (5+ records):
   - `view_talent_pool`, `create_skill_need`, `create_mission`, `approve_mission`, `purchase_credits`

3. **Role-Permission Mappings**:
   - `talent`: `view_talent_pool`, `create_mission` (self-proposal)
   - `talent_manager`: All permissions

4. **Skills Taxonomy** (~100 records from ESCO):
   - 10-15 categories: Engineering, Design, Marketing, Business Analysis, Sales, Product Management, Data Science, Finance, Legal, HR, Operations, Customer Support
   - ~7 skills per category (see research.md Topic 1)

### Seed Script Structure

```typescript
// packages/database/seeds/001-system-data.ts
export async function seed(db: DrizzleDB) {
  // 1. Insert system roles
  await db.insert(roles).values([
    { id: 'role_talent', name: 'talent', scope: 'system', description: '...' },
    {
      id: 'role_talent_manager',
      name: 'talent_manager',
      scope: 'system',
      description: '...',
    },
  ]);

  // 2. Insert permissions
  await db.insert(permissions).values([
    {
      id: 'perm_view_talent_pool',
      name: 'view_talent_pool',
      resource: 'talent_pool',
      action: 'view',
    },
    // ...
  ]);

  // 3. Map role-permissions
  await db.insert(rolePermissions).values([
    { roleId: 'role_talent', permissionId: 'perm_view_talent_pool' },
    // ...
  ]);

  // 4. Insert skills (from ESCO CSV)
  const escoSkills = await loadESCOSkills();
  await db.insert(skills).values(escoSkills);
}
```

---

## Migration Notes

### SQLite → PostgreSQL Compatibility

**Type Mappings**:

- SQLite `TEXT` → PostgreSQL `VARCHAR(n)` or `TEXT`
- SQLite `INTEGER` (timestamp) → PostgreSQL `TIMESTAMPTZ`
- SQLite `INTEGER` (boolean) → PostgreSQL `BOOLEAN`

**Drizzle Dialect Switch**:

```typescript
// packages/database/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema',
  out: './migrations',
  driver: process.env.DB_TYPE === 'postgres' ? 'pg' : 'better-sqlite3',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
});
```

**Full-Text Search Migration**:

- SQLite: `CREATE VIRTUAL TABLE skills_fts USING fts5(name, category);`
- PostgreSQL: `CREATE INDEX idx_skills_name_trgm ON skills USING gin(name gin_trgm_ops);`

---

## Next Steps

1. ✅ **Data Model Complete**: All 13 entities defined with schemas
2. **Generate API Contracts**: OpenAPI specs in `contracts/` (Phase 1 next step)
3. **Implement Repository Adapters**: Drizzle implementations for domain ports
4. **Create Database Migrations**: Run `drizzle-kit generate` to create migration files
5. **Seed Database**: Implement seed scripts for system data + ESCO skills

**Status**: ✅ Ready for API contract generation
