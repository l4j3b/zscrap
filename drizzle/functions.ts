import { sql } from 'drizzle-orm';

import { initializeDbClient } from '~/lib/db.server/initialize-db-client';

/* API Credits Functions */

interface DeductApiCreditResult {
  [key: string]: number;
  updated_credits: number;
}

const deductApiCredit = sql<DeductApiCreditResult>`
  CREATE OR REPLACE FUNCTION deduct_api_credit(org_id UUID)
  RETURNS TABLE (updated_credits DOUBLE PRECISION, credits_deducted BOOLEAN) AS $$
  DECLARE
    current_credits DOUBLE PRECISION;
  BEGIN
    -- Lock the row to prevent concurrent updates
    SELECT api_credits INTO current_credits
    FROM organizations
    WHERE id = org_id
    FOR UPDATE;

    IF current_credits > 0 THEN
      UPDATE organizations
      SET api_credits = current_credits - 1
      WHERE id = org_id;

      RETURN QUERY
      SELECT current_credits - 1 AS updated_credits, TRUE AS credits_deducted;
    ELSE
      RETURN QUERY
      SELECT current_credits AS updated_credits, FALSE AS credits_deducted;
    END IF;
  END;
  $$ LANGUAGE plpgsql;
`;

interface AddApiCreditResult {
  [key: string]: number;
  updated_credits: number;
}

const addApiCredit = sql<AddApiCreditResult>`
  CREATE OR REPLACE FUNCTION add_api_credit(org_id UUID)
  RETURNS TABLE (updated_credits DOUBLE PRECISION) AS $$
  DECLARE
    current_credits DOUBLE PRECISION;
  BEGIN
    -- Lock the row to prevent concurrent updates
    SELECT api_credits INTO current_credits
    FROM organizations
    WHERE id = org_id
    FOR UPDATE;

    UPDATE organizations
    SET api_credits = current_credits + 1
    WHERE id = org_id;

    RETURN QUERY
    SELECT current_credits + 1 AS updated_credits;
  END;
  $$ LANGUAGE plpgsql;
`;

async function initDatabase() {
  if (!process.env.DIRECT_DATABASE_URL) {
    throw new Error('Missing required environment variable DIRECT_DATABASE_URL');
  }

  console.log('Creating database functions...');

  const db = await initializeDbClient({
    databaseUrl: process.env.DIRECT_DATABASE_URL,
  });

  await db.execute(addApiCredit);
  await db.execute(deductApiCredit);
}

initDatabase()
  .then(() => {
    console.log('Database functions created successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error creating database functions:', err);
    process.exit(1);
  });
