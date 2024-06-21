import type { MetaFunction } from '@remix-run/cloudflare';

import { ThemeToggle } from '~/components/app/ThemeToggle';
import { Card, CardContent } from '~/components/ui/card';
import { Section, SectionContent, SectionHeader, SectionTitle } from '~/components/ui/section';
import { config } from '~/config';

export const meta: MetaFunction = () => {
  return [{ title: `Settings - ${config.app.name}` }];
};

export default function SettingsRoute() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Settings</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <Card className="h-full">
          <CardContent>
            <div className="flex w-fit min-w-72 items-center space-x-4">
              <div className="min-w-24">Theme:</div>

              <ThemeToggle variant={'outline'} />
            </div>
          </CardContent>
        </Card>
      </SectionContent>
    </Section>
  );
}
