import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../../database/drizzle/drizzle.provider';
import * as schema from '../../database/drizzle/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

@Injectable()
export class GuestRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: NodePgDatabase<typeof schema>,
  ) {}

  async getAggregatedData(cacheKey: string) {
    const result = await this.db
      .select({ data: schema.aggrCache.data })
      .from(schema.aggrCache)
      .where(eq(schema.aggrCache.cacheKey, cacheKey))
      .limit(1);

    return result[0]?.data as any;
  }
}
