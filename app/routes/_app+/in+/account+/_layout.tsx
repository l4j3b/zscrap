import { Outlet } from '@remix-run/react';
import { Building2, CreditCard, Settings, User, Lock, HelpCircle } from 'lucide-react';
import { $path } from 'remix-routes';

import { OrganizationRoles } from 'drizzle/schema';
import { Sidebar } from '~/components/app/Sidebar';
import { SidebarLayout } from '~/components/app/SidebarLayout';

import { useActiveOrg } from '../../_layout';

export default function MiscLayout() {
  const { activeOrg } = useActiveOrg();

  const items = [
    {
      to: $path('/in/account/profile'),
      children: (
        <div className="flex flex-row items-center">
          <User className="mr-3 size-4" />
          Profile
        </div>
      ),
      end: true,
    },
    {
      to: $path('/in/account/organization'),
      children: (
        <div className="flex flex-row items-center">
          <Building2 className="mr-3 size-4" />
          Organization
        </div>
      ),
    },
    {
      to: $path('/in/account/billing'),
      children: (
        <div className="flex flex-row items-center">
          <CreditCard className="mr-3 size-4" />
          Billing
        </div>
      ),
    },
    {
      to: $path('/in/account/help'),
      children: (
        <div className="flex flex-row items-center">
          <HelpCircle className="mr-3 size-4" />
          Help
        </div>
      ),
    },
    activeOrg?.role === OrganizationRoles.Owner
      ? {
          to: $path('/in/account/api'),
          children: (
            <div className="flex flex-row items-center">
              <Lock className="mr-3 size-4" />
              API
            </div>
          ),
        }
      : undefined,
    {
      to: $path('/in/account/settings'),
      children: (
        <div className="flex flex-row items-center">
          <Settings className="mr-3 size-4" />
          Settings
        </div>
      ),
    },
  ].filter((el) => el !== undefined);

  return (
    <SidebarLayout sidebar={<Sidebar groups={[{ items }]} />}>
      <Outlet />
    </SidebarLayout>
  );
}
