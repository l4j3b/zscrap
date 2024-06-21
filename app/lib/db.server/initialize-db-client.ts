import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../../../drizzle/schema';

export const initializeDbClient = async ({ databaseUrl }: { databaseUrl: string }) => {
  const client = postgres(databaseUrl, {
    prepare: false,
    idle_timeout: 1,
  });

  const db = drizzle(client, { schema });

  return db;
};

export type DbClient = Awaited<ReturnType<typeof initializeDbClient>>;
