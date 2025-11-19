import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from 'src/database/drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/database/drizzle/schema';
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
