import { useLoaderData } from '@remix-run/react';
import { Ellipsis } from 'lucide-react';
import { toast } from 'sonner';

import { OrganizationRoles } from 'drizzle/schema';
import { Loader } from '~/components/app/Loader';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '~/components/ui/table';
import { useConfirmDialog } from '~/lib/hooks/use-confirm-dialog';
import { useResolvePromise } from '~/lib/hooks/use-resolve-promise';

import { useRemoveUserAction } from '../../_actions+/remove-user';
import { loader } from '../../_index';

import { AddUserDialog } from './AddUserDialog';
import { UserRoleSelect } from './UserRoleSelect';

export function OrganizationUsers() {
  const data = useLoaderData<typeof loader>();
  const { result: organization, loading } = useResolvePromise(
    data?.organization,
    'organization_users',
  );

  const removeUser = useRemoveUserAction();
  const confirmDialog = useConfirmDialog();
  const isLoaded = !loading && organization;

  if (!organization?.role || organization?.role === OrganizationRoles.Member) {
    return null;
  }

  return (
    <Card
      className="opacity-0 transition-opacity"
      style={{
        opacity: isLoaded ? 1 : 0,
      }}
    >
      <CardHeader className="flex-row items-center">
        <CardTitle>
          Users&nbsp;
          <span className="text-xl font-normal text-foreground/40">
            (<span className="text-lg font-bold">{organization?.usersToOrganizations.length}</span>)
          </span>
        </CardTitle>

        <div className="">
          <AddUserDialog />
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative min-h-48">
          <Loader loading={!isLoaded} relative />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-64">Name</TableHead>
                <TableHead className="w-64">Email</TableHead>
                <TableHead className="w-48">Role</TableHead>
                <TableHead className="w-12 text-right"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {organization?.usersToOrganizations.map(({ user, role }) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.displayName}</TableCell>

                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <UserRoleSelect userId={user.id} role={role} />
                  </TableCell>

                  <TableCell className="flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Ellipsis />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={async () => {
                            confirmDialog({
                              title: 'Remove user',
                              description:
                                'Are you sure you want to remove this user from the organization?',
                              okText: 'Remove user',
                              okType: 'destructive',
                              onConfirm: async () => {
                                const result = await removeUser.submit({
                                  userId: user.id,
                                });

                                if (result?.error) {
                                  toast.error(result.error);
                                } else {
                                  toast.success('User removed.');
                                }
                              },
                            });
                          }}
                        >
                          Remove user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
