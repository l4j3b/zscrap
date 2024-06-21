import { getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { defer } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { OrganizationRoles, usersTable } from 'drizzle/schema';
import { Field, FieldError } from '~/components/app/Field';
import { Loader } from '~/components/app/Loader';
import { Pre } from '~/components/app/Pre';
import { InputConform } from '~/components/conform/Input';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Section, SectionContent, SectionHeader, SectionTitle } from '~/components/ui/section';
import { config } from '~/config';
import { useConfirmDialog } from '~/lib/hooks/use-confirm-dialog';
import { useResolvePromise } from '~/lib/hooks/use-resolve-promise';
import { cn } from '~/lib/utils';

import { useSetActiveOrg } from '../../actions+/set-active-org';

import { useLeaveOrgAction } from './_actions+/leave-org';
import { useUpdateUserAction } from './_actions+/update-user';

export const meta: MetaFunction = () => {
  return [{ title: `Profile - ${config.app.name}` }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { sessionUserId, activeOrganizationId } = context.getSession();

  const user = context.db.query.usersTable
    .findFirst({
      where: eq(usersTable.id, sessionUserId),
      with: {
        usersToOrganizations: {
          with: { organization: true },
        },
      },
    })
    .then((user) => user);

  return defer({ user, activeOrganizationId });
}

export default function ProfileRoute() {
  const $form = useRef<HTMLFormElement>(null);
  const data = useLoaderData<typeof loader>();
  const [isEditing, setIsEditing] = useState(false);
  const { result: user, loading } = useResolvePromise(data.user, 'profile_route');
  const setActiveOrg = useSetActiveOrg();
  const leaveOrg = useLeaveOrgAction();
  const confirmDialog = useConfirmDialog();
  const updateUser = useUpdateUserAction();

  const [form, fields] = useForm({
    id: `edit-user_${user?.id}`,
    constraint: getZodConstraint(updateUser.schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: {
      displayName: user?.displayName,
      username: user?.username,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateUser.schema });
    },
    onSubmit: async (e, context) => {
      e.preventDefault();
      if (context.submission?.status !== 'success') return;
      (e.target as HTMLFormElement).querySelector('input')?.blur();
      const result = await updateUser.submit(context.submission.value);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile updated successfully.');
        setIsEditing(false);
      }
    },
  });

  return (
    <>
      <Loader loading={setActiveOrg.loading} blocking background />

      <Section>
        <SectionHeader>
          <SectionTitle>Profile</SectionTitle>
        </SectionHeader>

        <SectionContent>
          <Card>
            <updateUser.Form
              {...getFormProps(form)}
              ref={$form}
              className="h-full"
              onChange={() => {
                setIsEditing(true);
              }}
            >
              <CardHeader className="flex-row items-center">
                <CardTitle>Settings</CardTitle>

                <div
                  className="flex flex-row items-center space-x-2 transition-opacity"
                  style={{
                    opacity: isEditing ? 1 : 0,
                  }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      $form.current?.reset();
                      setIsEditing(false);
                    }}
                    disabled={updateUser.submitting}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" loading={updateUser.submitting}>
                    Save
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Field className="w-fit min-w-72">
                  <Label htmlFor="displayName">Name</Label>
                  <InputConform loading={loading} meta={fields.displayName} type="text" />
                  <FieldError>{fields.displayName.errors}</FieldError>
                </Field>

                <Field className="w-fit min-w-72">
                  <Label htmlFor="username">Username</Label>
                  <InputConform loading={loading} meta={fields.username} type="text" />
                  <FieldError>{fields.username.errors}</FieldError>
                </Field>

                <div className="w-fit min-w-72 space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input disabled defaultValue={user?.email} loading={loading} type="email" />
                </div>
              </CardContent>
            </updateUser.Form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>
                Click on an organization to change the active organization.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div
                className={`
                  relative grid min-h-24 w-full grid-cols-1 gap-4
                  lg:grid-cols-2
                  xl:grid-cols-3
                `}
              >
                <Loader loading={loading && !user} relative />

                {user?.usersToOrganizations.map((uto, index) => (
                  <div
                    key={uto.createdAt}
                    role="button"
                    tabIndex={index}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setActiveOrg.submit({
                          organizationId: uto.organization.id,
                        });
                      }
                    }}
                    onClick={async () => {
                      await setActiveOrg.submit({
                        organizationId: uto.organization.id,
                      });
                    }}
                    className={cn(
                      `
                        flex cursor-pointer items-center space-x-4 rounded-md border-2 bg-input p-5
                        transition-colors duration-300
                        hover:border-primary
                      `,
                      {
                        'border-primary': uto.organization.id === data.activeOrganizationId,
                      },
                    )}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="font-semibold">
                        {uto.organization.name}

                        {uto.organization.id === data.activeOrganizationId && (
                          <Badge variant={'secondary'} className="ml-4">
                            Active
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-gray-500">role: {uto.role}</div>

                      <div
                        className={`flex h-8 w-fit items-center space-x-2 text-sm text-gray-500`}
                      >
                        <Label className="">Credits:</Label>
                        <Pre className="min-h-0 p-1 px-2 text-foreground" nocopy>
                          {uto.organization.apiCredits}
                        </Pre>
                      </div>
                    </div>

                    {uto.role !== OrganizationRoles.Owner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={leaveOrg.submitting}
                        onClick={async () => {
                          confirmDialog({
                            title: 'Leave organization',
                            description: `Are you sure you want to leave ${uto.organization.name}?`,
                            okText: 'Leave',
                            onConfirm: async () => {
                              const result = await leaveOrg.submit({
                                organizationId: uto.organization.id,
                              });

                              if (result?.error) {
                                toast.error(result.error);
                              } else {
                                toast.success('Organization left.');
                              }
                            },
                          });
                        }}
                      >
                        Leave
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* <Card>
				<CardHeader>
					<CardTitle>Password</CardTitle>
				</CardHeader>

				<CardContent>
					<div className="space-y-6">
						<div className="w-fit min-w-72 space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" name="password" type="password" />
						</div>

						<div className="w-fit min-w-72 space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
							/>
						</div>
					</div>
				</CardContent>
			</Card> */}
        </SectionContent>
      </Section>
    </>
  );
}
