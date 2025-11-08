import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';
import { users } from './users';

// Skills taxonomy table
export const skills = sqliteTable(
  'skills',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    name: text('name').notNull(),
    category: text('category').notNull(),
    description: text('description'),
    isApproved: integer('is_approved', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_skills_name').on(table.name),
    index('idx_skills_category').on(table.category),
  ]
);

// UserSkill junction table
export const userSkills = sqliteTable(
  'user_skills',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
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
  (table) => [
    unique('unique_user_skill').on(table.userId, table.skillId),
    index('idx_user_skills_user_id').on(table.userId),
    index('idx_user_skills_skill_id').on(table.skillId),
  ]
);

// TalentAvailability table
export const talentAvailability = sqliteTable(
  'talent_availability',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id),
    availabilityPct: integer('availability_pct').notNull().default(0),
    isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
    isAnonymized: integer('is_anonymized', { mode: 'boolean' }).notNull().default(true),
    activeFrom: integer('active_from', { mode: 'timestamp' }),
    activeUntil: integer('active_until', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_talent_availability_pct').on(table.availabilityPct),
  ]
);

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type UserSkill = typeof userSkills.$inferSelect;
export type NewUserSkill = typeof userSkills.$inferInsert;
export type TalentAvailability = typeof talentAvailability.$inferSelect;
export type NewTalentAvailability = typeof talentAvailability.$inferInsert;
