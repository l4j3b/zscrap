import { Link } from '@remix-run/react';
import { $path } from 'remix-routes';

import { AuthFormCard } from '~/components/app/AuthFormCard';

const NoAccess = () => {
  return (
    <AuthFormCard
      title={'Access denied'}
      description={
        <>
          <p className="mb-4">
            You have been added to the waitlist. We will notify you when you have access.
          </p>

          <p className="mb-4">
            To go back to the home page, <Link to={$path('/')}>click here</Link>.
          </p>
        </>
      }
    />
  );
};

export default NoAccess;
