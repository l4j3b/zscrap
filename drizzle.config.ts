import { defineConfig } from 'drizzle-kit';

if (!process.env.DIRECT_DATABASE_URL) {
  throw new Error('DIRECT_DATABASE_URL is not set');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL as string,
  },
});
