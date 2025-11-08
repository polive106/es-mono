import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';
import { companies } from './companies';
import { missions } from './missions';
import { users } from './users';

export const creditTransactions = sqliteTable(
  'credit_transactions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id),
    amount: integer('amount').notNull(),
    type: text('type', { enum: ['mission', 'purchase', 'adjustment'] }).notNull(),
    description: text('description').notNull(),
    missionId: text('mission_id').references(() => missions.id),
    initiatedByUserId: text('initiated_by_user_id').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_credit_transactions_company_id').on(table.companyId),
    index('idx_credit_transactions_type').on(table.type),
    index('idx_credit_transactions_mission_id').on(table.missionId),
  ]
);

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
