import fs from 'fs';

import { json, useLoaderData } from '@remix-run/react';

import { Pre } from '~/components/app/Pre';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';

import { extractBodyText } from './lib/test-extract';

export async function loader() {
  const html = fs.readFileSync('assets/tests/scraped_data.txt', 'utf8');

  return json({ html });
}

export default function HTMLCleanup() {
  const data = useLoaderData<typeof loader>();
  const { html, text } = extractBodyText(data.html);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>HTML cleanup</CardTitle>
        </CardHeader>

        <CardContent className="relative min-h-24">
          <div>
            <p>Text length: {text.length}</p>
            <p>HTML length: {html?.length}</p>
          </div>

          <Pre>{text}</Pre>
          <Pre>{html}</Pre>
        </CardContent>
      </Card>
    </>
  );
}
