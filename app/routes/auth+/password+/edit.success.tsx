import { $path } from 'remix-routes';

import { AuthFormCard } from '~/components/app/AuthFormCard';

export default function AuthResetPasswordSuccess() {
  return (
    <>
      <AuthFormCard
        title={'Reset password'}
        description={
          <>
            <p>Your password has been successfully reset.</p>

            <p>
              To go back to the app, <a href={$path('/in')}>Click here</a>.
            </p>
          </>
        }
      />
    </>
  );
}
