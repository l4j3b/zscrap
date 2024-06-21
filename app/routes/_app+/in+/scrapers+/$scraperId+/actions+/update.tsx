import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { and, eq } from 'drizzle-orm';
import { $params, $path } from 'remix-routes';
import { z } from 'zod';

import { scrapersTable } from 'drizzle/schema';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = (scraperId: string) =>
  $path('/in/scrapers/:scraperId/actions/update', { scraperId });

const schema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name is too short (min 3 characters)')
    .max(24, 'Name is too long (max 24 characters)'),
});

export async function action({ request, context, params }: ActionFunctionArgs) {
  const { scraperId } = $params('/in/scrapers/:scraperId', params);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    throw new Error('Invalid form submission.');
  }

  const { name } = submission.value;
  const { activeOrganizationId } = context.getSession();

  await context.db
    .update(scrapersTable)
    .set({
      name,
    })
    .where(
      and(eq(scrapersTable.id, scraperId), eq(scrapersTable.organizationId, activeOrganizationId)),
    );

  return json({ error: null });
}

export const useUpdateScraperAction = (scraperId: string) =>
  createUseActionHook<typeof action, typeof schema>(actionPath(scraperId), schema)();
