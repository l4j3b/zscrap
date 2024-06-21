import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { defer } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { eq } from 'drizzle-orm';

import { usersTable } from 'drizzle/schema';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useResolvePromise } from '~/lib/hooks/use-resolve-promise';

export async function loader({ context }: LoaderFunctionArgs) {
  const { sessionUserId } = context.getSession();

  const user = context.db.query.usersTable
    .findFirst({
      where: eq(usersTable.id, sessionUserId),
    })
    .then((user) => user);

  return defer({ user });
}

export default function Profile() {
  const data = useLoaderData<typeof loader>();
  const { result: user, loading } = useResolvePromise(data.user);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example: Data: Deferred loader</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="w-fit min-w-72 space-y-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={user?.displayName}
              loading={loading}
            />
          </div>

          <div className="w-fit min-w-72 space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" defaultValue={user?.username} loading={loading} />
          </div>

          <div className="w-fit min-w-72 space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" disabled defaultValue={user?.email} loading={loading} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
