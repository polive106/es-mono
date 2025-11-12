import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';
import { companies } from './companies';
import { users } from './users';
import { skills } from './skills';

// SkillNeed table
export const skillNeeds = sqliteTable(
  'skill_needs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
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
    status: text('status', { enum: ['open', 'matched', 'fulfilled', 'cancelled'] })
      .notNull()
      .default('open'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_skill_needs_company_id').on(table.companyId),
    index('idx_skill_needs_skill_id').on(table.skillId),
    index('idx_skill_needs_status').on(table.status),
  ]
);

// Mission table
export const missions = sqliteTable(
  'missions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
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
  (table) => [
    index('idx_missions_proposing_company').on(table.proposingCompanyId),
    index('idx_missions_receiving_company').on(table.receivingCompanyId),
    index('idx_missions_talent_user').on(table.talentUserId),
    index('idx_missions_status').on(table.status),
  ]
);

// Approval table
export const approvals = sqliteTable(
  'approvals',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    missionId: text('mission_id')
      .notNull()
      .references(() => missions.id),
    type: text('type', { enum: ['employee_consent', 'manager_approval', 'legal_check'] }).notNull(),
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
  (table) => [
    unique('unique_mission_type').on(table.missionId, table.type),
    index('idx_approvals_mission_id').on(table.missionId),
  ]
);

// NDA table
export const ndas = sqliteTable('ndas', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
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

// TimeLog table
export const timeLogs = sqliteTable(
  'time_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
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
  (table) => [
    index('idx_time_logs_mission_id').on(table.missionId),
    index('idx_time_logs_user_id').on(table.userId),
  ]
);

export type SkillNeed = typeof skillNeeds.$inferSelect;
export type NewSkillNeed = typeof skillNeeds.$inferInsert;
export type Mission = typeof missions.$inferSelect;
export type NewMission = typeof missions.$inferInsert;
export type Approval = typeof approvals.$inferSelect;
export type NewApproval = typeof approvals.$inferInsert;
export type NDA = typeof ndas.$inferSelect;
export type NewNDA = typeof ndas.$inferInsert;
export type TimeLog = typeof timeLogs.$inferSelect;
export type NewTimeLog = typeof timeLogs.$inferInsert;
