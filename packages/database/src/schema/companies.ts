import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';

export const companies = sqliteTable(
  'companies',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: text('name').notNull().unique(),
    industry: text('industry').notNull(),
    size: text('size', { enum: ['1-10', '11-50', '51-200', '201-500'] }).notNull(),
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
  },
  (table) => [index('idx_companies_invite_code').on(table.inviteCode)]
);

// Helper function to generate invite codes
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
