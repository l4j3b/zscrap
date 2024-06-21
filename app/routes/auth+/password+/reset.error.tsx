import { Link } from '@remix-run/react';
import { $path } from 'remix-routes';

import { AuthFormCard } from '~/components/app/AuthFormCard';

export default function AuthResetPasswordSuccess() {
  return (
    <AuthFormCard
      title={'Reset password'}
      description={
        <p>
          The password could not be reset. You can try to request a new link to reset your password{' '}
          <Link to={$path('/auth/password/reset')}>here</Link>.
        </p>
      }
    />
  );
}
