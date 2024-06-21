import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { Form, Link, redirect, useNavigation } from '@remix-run/react';
import { $path } from 'remix-routes';

import { AuthFormCard } from '~/components/app/AuthFormCard';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { resetPassword } from '~/lib/auth.server/actions/reset-password';

export default function AuthForgotPassword() {
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <>
      {/* <Loader loading={loading} /> */}

      <AuthFormCard
        title={'Reset password'}
        description={
          'Enter the email address associated with your account and we’ll send you a link to reset your password.'
        }
        footer={
          <>
            <p>
              Don&apos;t have an account? <Link to={$path('/auth/sign-up')}>Sign up</Link>
            </p>
            <p>
              Back to <Link to={$path('/auth/sign-in')}>Sign in</Link>
            </p>
          </>
        }
      >
        <Form method="post" className="space-y-4">
          <Input type="email" name="email" placeholder="Email" required />
          <Button
            className="w-full"
            type="submit"
            variant={'secondary'}
            size={'lg'}
            loading={isSubmitting}
          >
            Send email
          </Button>
        </Form>
      </AuthFormCard>
    </>
  );
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  const { error } = await resetPassword({ context, email });

  if (error) {
    return redirect($path('/auth/password/reset/error'));
  }

  return redirect($path('/auth/password/reset/success'));
}
