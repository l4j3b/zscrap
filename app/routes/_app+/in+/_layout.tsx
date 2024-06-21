import { Outlet } from '@remix-run/react';
import { useEffect } from 'react';
import { $path } from 'remix-routes';
import { toast } from 'sonner';

import { BuyCreditsButton } from '~/components/app/BuyCreditsButton';
import { Loader } from '~/components/app/Loader';
import { Navbar } from '~/components/app/Navbar';
import { SelectWrapper } from '~/components/app/SelectWrapper';
import { ThemeToggle } from '~/components/app/ThemeToggle';
import { UserMenu } from '~/components/app/UserMenu';
import { useActiveOrg, useActiveUser, useUserSession } from '~/routes/_app+/_layout';

import { useSetActiveOrg } from './actions+/set-active-org';

const AppLayout = () => {
  const { session } = useUserSession();
  const setActiveOrg = useSetActiveOrg();
  const { user } = useActiveUser();
  const { activeOrg } = useActiveOrg();

  const items = [
    { to: $path('/in'), children: 'Dashboard', end: true },
    { to: $path('/in/scrapers'), children: 'Scrapers', end: false },
  ];

  if (session?.isAdmin) {
    items.push({ to: $path('/restricted'), children: 'Admin', end: true });
  }

  useEffect(() => {
    if (
      typeof activeOrg?.organization.apiCredits === 'number' &&
      activeOrg.organization.apiCredits <= 0
    ) {
      toast.error('You don’t have any credits left. To continue, please add more credits.');
    }
  }, [activeOrg]);

  return (
    <div className="flex h-full flex-col">
      <Loader loading={setActiveOrg.loading} blocking background />
      <Navbar
        hideLogoText
        left={
          <OrgSelect
            user={user}
            activeOrgId={session?.activeOrganizationId}
            setActiveOrg={setActiveOrg}
          />
        }
        items={items}
        right={
          <>
            <BuyCreditsButton
              numCredits={activeOrg?.organization.apiCredits}
              className={`max-sm:hidden`}
            />

            <ThemeToggle />
            <UserMenu displayName={session?.displayName} username={session?.username} />
          </>
        }
      />
      <Outlet />
    </div>
  );
};

export default AppLayout;

const OrgSelect = ({
  activeOrgId,
  setActiveOrg,
  user,
}: {
  activeOrgId?: string;
  setActiveOrg: ReturnType<typeof useSetActiveOrg>;
  user: ReturnType<typeof useActiveUser>['user'];
}) => {
  return (
    <SelectWrapper
      id="org-select"
      className="mr-6 w-40"
      placeholder="Active org"
      loading={setActiveOrg.submitting || !user}
      defaultValue={activeOrgId}
      items={
        user?.usersToOrganizations?.map(({ organization: { id, name } }) => ({
          name,
          value: id,
        })) || []
      }
      onValueChange={async (organizationId) => {
        await setActiveOrg.submit({ organizationId });
      }}
    />
  );
};
