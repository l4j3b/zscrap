import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { Form, Link, useNavigate, useNavigation, useSearchParams } from '@remix-run/react';
import { Provider } from '@supabase/supabase-js';
import { $path } from 'remix-routes';
import { z } from 'zod';

import {
  AuthFormCard,
  AuthFormCardGoogleButton,
  AuthFormCardSeparator,
} from '~/components/app/AuthFormCard';
import { InputPassword } from '~/components/app/InputPassword';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { signInWithPassword } from '~/lib/auth.server/actions/sign-in-with-password';

const SearchParamsSchema = z.object({
  redirect: z.string().optional(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

export async function loader({ context }: LoaderFunctionArgs) {
  // redirect if signed in
  if (context.sessionUserId) {
    return redirect($path('/in'));
  }

  return {};
}

export default function SignIn() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || $path('/in');
  const navigation = useNavigation();
  const navigate = useNavigate();

  const isSubmitting = navigation.state === 'submitting';

  const handleGoogleAuth = async () => {
    const provider = 'google' as Provider;
    const baseUrl = $path('/auth/oauth');

    // window.location.href = `${baseUrl}?provider=${provider}&redirect=${encodeURIComponent(redirectUrl)}`;
    navigate(`${baseUrl}?provider=${provider}&redirect=${encodeURIComponent(redirectUrl)}`);
  };

  return (
    <>
      {/* <Loader loading={loading} /> */}

      <AuthFormCard
        title={'Sign in'}
        footer={
          <>
            <p>
              Don&apos;t have an account? <Link to={$path('/auth/sign-up')}>Sign up</Link>
            </p>
            <p>
              <Link to={$path('/auth/password/reset')}>Forgot password?</Link>
            </p>
          </>
        }
      >
        <AuthFormCardGoogleButton
          text="Sign in with Google"
          handleGoogleAuth={handleGoogleAuth}
          loading={navigation.state === 'loading'}
        />

        <AuthFormCardSeparator />

        <Form method="post" className="space-y-4">
          <Input type="hidden" name="redirectUrl" value={redirectUrl} />
          <Input type="email" name="email" placeholder="Email" required />
          <InputPassword type="password" name="password" placeholder="Password" required />
          <Button
            className="w-full"
            type="submit"
            variant={'secondary'}
            size={'lg'}
            loading={isSubmitting}
          >
            Sign in
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
    await signInWithPassword({
      context,
      email,
      password,
    });
  } catch (error) {
    console.log('Error signing in with password', error);

    return redirect($path('/auth/no-access'));
  }

  return redirect(redirectUrl);
}
