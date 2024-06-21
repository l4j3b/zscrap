import { type LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';

import { Pre } from '~/components/app/Pre';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';

export async function loader({ context }: LoaderFunctionArgs) {
  const { session } = context;

  return json({
    session,
  });
}

export default function AdminSession() {
  const { session } = useLoaderData<typeof loader>();

  let sbData = Object.keys(session.data)
    .filter((key) => key.startsWith('sb-') && key.includes('-auth-token.'))
    .map((key) => {
      return session.data[key as keyof typeof session.data];
    })
    .join(' ');

  try {
    sbData = JSON.parse(sbData);
  } catch (error) {
    // console.warn("Admin: supabase data parsing error: ", error);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <Pre>{JSON.stringify(session, null, 2)}</Pre>
          </div>

          <h2 className="mt-4 text-xl">Supabase</h2>

          <div className="mt-4">
            <Pre>{JSON.stringify(sbData, null, 2)}</Pre>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
