import { sqliteTable, text, integer, index, unique, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { companies } from './companies';

// Users table
export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    languagePref: text('language_pref', { enum: ['en', 'fr'] })
      .notNull()
      .default('en'),
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id),
    lastActivityAt: integer('last_activity_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    isAnonymized: integer('is_anonymized', { mode: 'boolean' }).notNull().default(false),
    anonymizedAt: integer('anonymized_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_users_company_id').on(table.companyId),
    index('idx_users_email').on(table.email),
  ]
);

// Roles table
export const roles = sqliteTable('roles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
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

// Permissions table
export const permissions = sqliteTable('permissions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull().unique(),
  resource: text('resource').notNull(),
  action: text('action', { enum: ['view', 'create', 'update', 'delete', 'approve'] }).notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// UserRole junction table (N:N with company context)
export const userRoles = sqliteTable(
  'user_roles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
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
  (table) => [
    unique('unique_user_role_company').on(
      table.userId,
      table.roleId,
      table.companyId
    ),
    index('idx_user_roles_user_id').on(table.userId),
    index('idx_user_roles_role_id').on(table.roleId),
  ]
);

// RolePermission junction table (N:N)
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
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
  ]
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  company: one(companies, {
    fields: [roles.companyId],
    references: [companies.id],
  }),
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  company: one(companies, {
    fields: [userRoles.companyId],
    references: [companies.id],
  }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
