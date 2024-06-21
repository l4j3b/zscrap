import { type LoaderFunctionArgs, defer } from '@remix-run/cloudflare';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';

import { Loader } from '~/components/app/Loader';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '~/components/ui/table';

import { useSwitchUser } from './actions+/switch-user';

export async function loader({ context }: LoaderFunctionArgs) {
  const users = context.db.query.usersTable.findMany().then((users) => users);

  return defer({
    users,
  });
}

export default function AdminUsers() {
  const { users } = useLoaderData<typeof loader>();
  const switchUser = useSwitchUser();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>

        <CardContent className="relative min-h-24">
          <Suspense fallback={<Loader loading relative />}>
            <Await resolve={users}>
              {(users) => (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.displayName}</TableCell>
                        <TableCell>{user.email}</TableCell>

                        <TableCell className="text-right">
                          {user.isAdmin && (
                            <Badge variant="secondary" className="ml-4">
                              Admin
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            onClick={async () => {
                              await switchUser.submit({
                                userId: user.id,
                              });

                              // Reload the page
                              window.location.reload();
                            }}
                          >
                            Switch
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Await>
          </Suspense>
        </CardContent>
      </Card>
    </>
  );
}
