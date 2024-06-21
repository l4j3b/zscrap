import { Outlet } from '@remix-run/react';

import { ThemeToggle } from '~/components/app/ThemeToggle';

const WebsiteLayout = () => {
  return (
    <>
      <div className="absolute right-0 top-0 flex justify-end">
        <div className="m-4">
          <ThemeToggle />
        </div>
      </div>

      <Outlet />
    </>
  );
};

export default WebsiteLayout;
