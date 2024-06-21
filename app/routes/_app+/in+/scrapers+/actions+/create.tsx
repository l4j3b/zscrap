import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { scrapersTable } from 'drizzle/schema';
import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = () => $path('/in/scrapers/actions/create');

const schema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name is too short (min 3 characters)')
    .max(24, 'Name is too long (max 24 characters)'),
  prompt: z.string({ required_error: 'Prompt is required' }),
  jsonSchema: z.string({ required_error: 'JSON schema is required' }),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    throw new Error('Invalid form submission.');
  }

  const { name, prompt, jsonSchema } = submission.value;
  const { activeOrganizationId } = context.getSession();

  const scraper = await context.db
    .insert(scrapersTable)
    .values({
      name,
      prompt,
      jsonSchema,
      organizationId: activeOrganizationId,
      createdById: context.sessionUserId,
    })
    .returning({
      id: scrapersTable.id,
    });

  const scraperId = scraper[0].id;

  return redirect($path(`/in/scrapers/:scraperId`, { scraperId }));
}

export const useCreateScraperAction = () =>
  createUseActionHook<typeof action, typeof schema>(actionPath(), schema)();
