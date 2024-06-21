import { Outlet } from '@remix-run/react';
import { $path } from 'remix-routes';

import { Navbar } from '~/components/app/Navbar';
import { ThemeToggle } from '~/components/app/ThemeToggle';
import { UserMenu } from '~/components/app/UserMenu';

import { useAppLoaderData } from '../_layout';

const AppLayout = () => {
  const { session } = useAppLoaderData();

  return (
    <div className="flex h-full flex-col">
      <Navbar
        hideLogoText
        items={[
          { to: $path('/restricted/admin'), children: 'Admin', end: false },
          { to: $path('/restricted/dev'), children: 'Dev', end: false },
        ]}
        right={
          <>
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
