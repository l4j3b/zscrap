import { randomBytes, createHmac } from 'node:crypto';

import { sql } from 'drizzle-orm';

import { apiKeysTable } from 'drizzle/schema';

import { DbClient } from './db.server/initialize-db-client';

function generateApiKey() {
  const key = `sk_${randomBytes(28).toString('hex')}`;

  return key;
}

function hashApiKey(apiKey: string, secret: string) {
  return createHmac('sha256', secret).update(apiKey).digest('hex');
}

function getApiKeySuffix(apiKey: string) {
  return apiKey.slice(-4);
}

export async function refreshApiKey(db: DbClient, organizationId: string, apiKeySecret: string) {
  const apiKey = generateApiKey();
  const hashedKey = hashApiKey(apiKey, apiKeySecret);
  const keySuffix = getApiKeySuffix(apiKey);

  // Will conflict if the organization already has an API key hence the onConflictDoUpdate
  await db
    .insert(apiKeysTable)
    .values({
      key: hashedKey,
      keySuffix,
      organizationId,
      createdAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: apiKeysTable.organizationId,
      set: {
        key: hashedKey,
        keySuffix,
      },
    });

  return apiKey;
}
