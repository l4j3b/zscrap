import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { Form, Link, useNavigation, useSearchParams } from '@remix-run/react';
import { Provider } from '@supabase/supabase-js';
import { $path } from 'remix-routes';

import {
  AuthFormCard,
  AuthFormCardGoogleButton,
  AuthFormCardSeparator,
} from '~/components/app/AuthFormCard';
import { InputPassword } from '~/components/app/InputPassword';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { signUpWithPassword } from '~/lib/auth.server/actions/sign-up-with-password';

export async function loader({ context }: LoaderFunctionArgs) {
  // redirect if signed in
  if (context.sessionUserId) {
    return redirect($path('/in'));
  }

  return {};
}

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || $path('/in');
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  const handleGoogleAuth = async () => {
    const provider = 'google' as Provider;
    const baseUrl = $path('/auth/oauth');

    window.location.href = `${baseUrl}?provider=${provider}&redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <>
      {/* <Loader loading={loading} /> */}

      <AuthFormCard
        title={`Sign up`}
        footer={
          <>
            <p>
              Already a user? <Link to={$path('/auth/sign-in')}>Sign in</Link>
            </p>
            <p>&nbsp;</p>
          </>
        }
      >
        <AuthFormCardGoogleButton text="Sign up with Google" handleGoogleAuth={handleGoogleAuth} />

        <AuthFormCardSeparator />

        <Form method="post" className="space-y-4">
          <Input type="hidden" name="redirectUrl" value={redirectUrl} />
          <Input type="email" name="email" placeholder="Email" required />

          <InputPassword name="password" placeholder="Password" required className="flex-1" />

          <Button
            className="w-full"
            type="submit"
            variant={'secondary'}
            size={'lg'}
            loading={isSubmitting}
          >
            Sign up
          </Button>
        </Form>
      </AuthFormCard>
    </>
  );
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const redirectUrl = formData.get('redirectUrl') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signUpWithPassword({ context, email, password });
  } catch (error) {
    return redirect($path('/auth/no-access'));
  }

  return redirect(redirectUrl);
}
