import { Outlet } from '@remix-run/react';
import { $path } from 'remix-routes';

import { Sidebar } from '~/components/app/Sidebar';
import { SidebarLayout } from '~/components/app/SidebarLayout';
import { Section, SectionContent } from '~/components/ui/section';

export default function AdminLayout() {
  return (
    <SidebarLayout
      sidebar={
        <Sidebar
          groups={[
            {
              items: [
                {
                  to: $path('/restricted/admin'),
                  children: 'Dashboard',
                  end: true,
                },
                { to: $path('/restricted/admin/users'), children: 'Users' },
                { to: $path('/restricted/admin/session'), children: 'Session' },
                { to: $path('/restricted/admin/scraper-errors'), children: 'Scraper errors' },
                { to: $path('/restricted/admin/html-cleanup'), children: 'HTML cleanup' },
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
