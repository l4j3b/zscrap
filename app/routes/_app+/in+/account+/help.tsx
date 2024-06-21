import type { MetaFunction } from '@remix-run/cloudflare';
import { useEffect } from 'react';

import { Card, CardContent } from '~/components/ui/card';
import { Section, SectionContent, SectionHeader, SectionTitle } from '~/components/ui/section';
import { config } from '~/config';
import { loadTawkTo } from '~/lib/load-tawk-to';

export const meta: MetaFunction = () => {
  return [{ title: `Help - ${config.app.name}` }];
};

export default function HelpRoute() {
  useEffect(() => {
    const cleanup = loadTawkTo();

    return () => {
      cleanup();
    };
  }, []);

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Help</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <Card className="h-full">
          <CardContent>
            You can contact us using the chat widget on the bottom right of the screen.
          </CardContent>
        </Card>
      </SectionContent>
    </Section>
  );
}
