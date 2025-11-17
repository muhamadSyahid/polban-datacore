import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

if (process.env.NODE_ENV === 'development') {
  const { parsed: parsedEnv } = dotenv.config({ path: '.env' });
  dotenvExpand.expand({ processEnv: process.env, parsed: parsedEnv });
}

export default defineConfig({
  dialect: 'postgresql',

  schema: './src/database/drizzle/schema/index.ts',

  out: './drizzle/migrations',

  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
