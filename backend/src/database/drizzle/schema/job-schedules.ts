import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const jobSchedules = pgTable('job_schedules', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),

  jobName: text('job_name').notNull().unique(),
  cronExpression: text('cron_expression').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
