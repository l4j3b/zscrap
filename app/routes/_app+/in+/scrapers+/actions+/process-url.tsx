import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import axios from 'axios';
import { $path } from 'remix-routes';
import { z } from 'zod';

import { createUseActionHook } from '~/lib/hooks/use-action';

const actionPath = $path('/in/scrapers/actions/process-url', {
  method: 'POST',
});

const schema = z.object({
  name: z.string(), // Not used, just to match the create schema,
  url: z.string(),
  prompt: z.string(),
  jsonSchema: z.string().optional(),
});

interface ProcessUrlResponse {
  result: {
    title: string;
    jsonResult: string | null;
    suggestion: string | null;
    jsonSchema: string | null;
  };
  usageInfo: {
    version: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    promptCost: number;
    completionCost: number;
    totalCost: number;
  } | null;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    throw new Error('Invalid form submission.');
  }

  const { url, prompt, jsonSchema } = submission.value;

  const response = await axios.post(
    `${context.cloudflare.env.SCRAPER_API_ENDPOINT_URL}`,
    { url, prompt, jsonSchema },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${context.cloudflare.env.SCRAPER_API_ENDPOINT_API_KEY}`,
      },
    },
  );

  return json({
    ...(response.data.result as ProcessUrlResponse['result']),
    error: null,
  });
}

export const useProcessUrlAction = createUseActionHook<typeof action, typeof schema>(
  actionPath,
  schema,
);
