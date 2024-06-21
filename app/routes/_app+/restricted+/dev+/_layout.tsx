import { Outlet } from '@remix-run/react';
import { $path } from 'remix-routes';

import { Sidebar } from '~/components/app/Sidebar';
import { SidebarLayout } from '~/components/app/SidebarLayout';
import { Section, SectionContent } from '~/components/ui/section';

export default function TestsLayout() {
  return (
    <SidebarLayout
      sidebar={
        <Sidebar
          groups={[
            {
              title: 'Resources',
              items: [
                {
                  to: $path('/restricted/dev/ui'),
                  children: 'UI Components',
                  end: true,
                },
              ],
            },
            {
              title: 'Examples',
              items: [
                {
                  to: $path('/restricted/dev/examples/stripe-checkout'),
                  children: 'Stripe checkout',
                },
                {
                  to: $path('/restricted/dev/examples/send-email-form'),
                  children: 'Send email form',
                },
                {
                  to: $path('/restricted/dev/examples/data-deferred-loader'),
                  children: 'Data: Deferred loader',
                },
                {
                  to: $path('/restricted/dev/examples/data-use-fetcher'),
                  children: 'Data: useFetcher',
                },
                {
                  to: $path('/restricted/dev/examples/data-fetcher-component'),
                  children: 'Data: Component',
                },
              ],
            },
            {
              title: 'Experiments',
              items: [
                {
                  to: $path('/restricted/dev/sandbox'),
                  children: 'Sandbox',
                },
                {
                  to: $path('/restricted/dev/pixel-builder'),
                  children: 'Pixel builder (Leva)',
                },
              ],
            },
          ]}
        />
      }
    >
      <Section>
        <SectionContent>
          <Outlet />
        </SectionContent>
      </Section>
    </SidebarLayout>
  );
}
