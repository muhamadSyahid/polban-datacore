import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_PROVIDER } from '../database/drizzle/drizzle.provider';
import * as schema from '../database/drizzle/schema';

@Injectable()
export class JobsRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {}

  async findAllSchedules() {
    return await this.db.select().from(schema.jobSchedules);
  }

  async findScheduleByName(jobName: string) {
    return await this.db.query.jobSchedules.findFirst({
      where: eq(schema.jobSchedules.jobName, jobName),
    });
  }

  async upsertSchedule(
    jobName: string,
    cronExpression: string,
    description?: string,
  ) {
    return await this.db
      .insert(schema.jobSchedules)
      .values({
        jobName,
        cronExpression,
        isActive: true,
        description,
      })
      .onConflictDoUpdate({
        target: schema.jobSchedules.jobName,
        set: {
          cronExpression,
          isActive: true,
          description,
          updatedAt: new Date(),
        },
      });
  }
}
