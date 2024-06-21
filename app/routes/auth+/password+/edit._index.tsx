import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { Form, Link, useNavigation } from '@remix-run/react';
import { $path } from 'remix-routes';

import { AuthFormCard } from '~/components/app/AuthFormCard';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { editPassword } from '~/lib/auth.server/actions/edit-password';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get('token_hash');

  if (!tokenHash) {
    console.error('No token hash provided');

    return redirect($path('/auth/password/edit/error'));
  }

  const { error } = await context.supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'recovery',
  });

  if (error) {
    console.error('Error verifying OTP', error);

    return redirect($path('/auth/password/edit/error'));
  }

  return {};
}

export default function EditPassword() {
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <>
      {/* <Loader loading={loading} /> */}

      <AuthFormCard
        title={'Reset password'}
        description={'Enter your new password to reset your password.'}
        footer={
          <p>
            Back to <Link to={$path('/auth/sign-in')}>Sign in</Link>
          </p>
        }
      >
        <Form method="post" className="space-y-4">
          <Input type="password" name="password" placeholder="Password" required />

          <Button
            className="w-full"
            type="submit"
            variant={'secondary'}
            size={'lg'}
            loading={isSubmitting}
          >
            Reset password
          </Button>
        </Form>
      </AuthFormCard>
    </>
  );
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const password = formData.get('password') as string;

  const { error } = await editPassword({ context, password });

  if (error) {
    return redirect($path('/auth/password/edit/error'));
  }

  return redirect($path('/auth/password/edit/success'));
}
