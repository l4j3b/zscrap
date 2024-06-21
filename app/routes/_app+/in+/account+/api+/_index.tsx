/* eslint-disable no-useless-escape */
import { defer, LoaderFunctionArgs, MetaFunction, redirect } from '@remix-run/cloudflare';
import { Await, useLoaderData } from '@remix-run/react';
import { and, eq, exists } from 'drizzle-orm';
import { AlertCircle, Plus, RefreshCcw, Trash } from 'lucide-react';
import { Suspense, useState } from 'react';
import { FaPython, FaNodeJs } from 'react-icons/fa';
import { SiCurl } from 'react-icons/si';
import { useGlobalPendingState } from 'remix-utils/use-global-navigation-state';
import { toast } from 'sonner';

import { apiKeysTable, OrganizationRoles, usersToOrganizations } from 'drizzle/schema';
import { Field } from '~/components/app/Field';
import { Loader } from '~/components/app/Loader';
import { Pre } from '~/components/app/Pre';
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { SectionHeader, SectionTitle, SectionContent, Section } from '~/components/ui/section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { config } from '~/config';
import { useConfirmDialog } from '~/lib/hooks/use-confirm-dialog';
import { useResolvePromise } from '~/lib/hooks/use-resolve-promise';
import { useActiveOrg } from '~/routes/_app+/_layout';

import { useDeleteApiKeyAction } from './actions+/delete-api-key';
import { useRefreshApiKeyAction } from './actions+/refresh-api-key';

export const meta: MetaFunction = () => {
  return [{ title: `API - ${config.app.name}` }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { activeOrganizationId, sessionUserId } = context.getSession();
  const { APP_URL, API_PATH } = context.cloudflare.env;
  const apiUrl = `${APP_URL}${API_PATH}`;

  // TODO: refactor queries/authorization
  const orgOwner = context.db
    .select()
    .from(usersToOrganizations)
    .where(
      and(
        eq(usersToOrganizations.userId, sessionUserId),
        eq(usersToOrganizations.organizationId, activeOrganizationId),
        eq(usersToOrganizations.role, OrganizationRoles.Owner),
      ),
    );

  // Done this way to use defer, not block the navigation
  orgOwner.then((orgOwner) => {
    if (!orgOwner.length) {
      return redirect('/');
    }
  });

  const apiKey = context.db.query.apiKeysTable
    .findFirst({
      where: and(eq(apiKeysTable.organizationId, activeOrganizationId), exists(orgOwner)),
      columns: {
        keySuffix: true,
      },
    })
    .then((apiKey) => apiKey || null);

  return defer({ apiKey, apiUrl });
}

const displayApiKey = (keySuffix?: string) => {
  return `sk_${'*'.repeat(6)}${keySuffix || '****'}`;
};

export default function OrganizationApiKey() {
  const data = useLoaderData<typeof loader>();
  const state = useGlobalPendingState();
  const confirmDialog = useConfirmDialog();
  const refreshApiKey = useRefreshApiKeyAction();
  const deleteApiKey = useDeleteApiKeyAction();
  const { result: apiKey } = useResolvePromise(data.apiKey);
  const [apiKeyValue, setApiKeyValue] = useState<string | undefined>(undefined);
  const { activeOrg } = useActiveOrg();

  if (activeOrg && activeOrg.role !== OrganizationRoles.Owner) {
    window.location.replace('/in');
  }

  const loading = state === 'pending';

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>API</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <Card className="h-full">
          <CardContent className="h-full">
            <Loader loading={loading} relative />

            <Suspense fallback={<Loader loading relative />}>
              <Await resolve={data.apiKey}>
                {(resolvedValue) => (
                  <div>
                    {!resolvedValue?.keySuffix && !loading && (
                      <div>
                        <p>{"Your organization currently doesn't have an API key."}</p>

                        <div className="mt-4">
                          <Button
                            loading={refreshApiKey.loading}
                            onClick={async () => {
                              const result = await refreshApiKey.submit({});

                              if (result?.error) {
                                toast.error(result.error);
                              } else if (result?.apiKey) {
                                toast.success('API Key created.');
                                setApiKeyValue(result.apiKey);
                              }
                            }}
                          >
                            <Plus className="mr-2 size-5" />
                            Create API key
                          </Button>
                        </div>
                      </div>
                    )}

                    {resolvedValue?.keySuffix && !loading && (
                      <Field>
                        <Label>API key</Label>
                        <p className="text-sm text-muted-foreground">
                          Only the last 4 characters are visible/stored.
                        </p>
                        <div className="flex items-center gap-2">
                          <Input value={displayApiKey(apiKey?.keySuffix)} disabled />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={async () => {
                              confirmDialog({
                                title: 'Refresh API key',
                                description:
                                  'Are you sure you want to refresh the API key? This will invalidate the current API key and create a new one.',
                                okText: 'Refresh API key',
                                okType: 'destructive',
                                onConfirm: async () => {
                                  const result = await refreshApiKey.submit({});

                                  if (result?.error) {
                                    toast.error(result.error);
                                  } else if (result?.apiKey) {
                                    toast.success('API Key refreshed.');
                                    setApiKeyValue(result.apiKey);
                                  }
                                },
                              });
                            }}
                          >
                            <RefreshCcw className="size-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="outline"
                            onClick={async () => {
                              confirmDialog({
                                title: 'Delete API key',
                                description:
                                  'Are you sure you want to delete the API key? This will invalidate the current API key and create a new one.',
                                okText: 'Delete API key',
                                okType: 'destructive',
                                onConfirm: async () => {
                                  const result = await deleteApiKey.submit({});

                                  if (result?.error) {
                                    toast.error(result.error);
                                  } else {
                                    setApiKeyValue(undefined);
                                    toast.success('API key deleted.');
                                  }
                                },
                              });
                            }}
                          >
                            <Trash className="size-4" />
                          </Button>
                        </div>
                      </Field>
                    )}

                    <div
                      className="mt-6 transition-all"
                      style={{
                        display: apiKeyValue && !loading ? 'block' : 'none',
                        opacity: apiKeyValue && !loading ? 1 : 0,
                      }}
                    >
                      <Alert variant="destructive" className="max-w-[640px]">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>This is your API key.</AlertTitle>
                        <AlertDescription>
                          It will be displayed only once. Please save that key in a secure location.
                          <br />
                          If you loose it, a new one can be created.
                          <div className="mt-4">
                            <Pre>{apiKeyValue}</Pre>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>

                    <div className="mt-6">
                      <Tabs defaultValue="curl" className="max-w-[640px]">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="curl" className="flex items-center gap-3">
                            <SiCurl className="size-4" />
                            cURL
                          </TabsTrigger>
                          <TabsTrigger value="nodejs" className="flex items-center gap-3">
                            <FaNodeJs className="size-4" />
                            Node.js
                          </TabsTrigger>
                          <TabsTrigger value="python" className="flex items-center gap-3">
                            <FaPython className="size-4" />
                            Python
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="curl">
                          <Pre className="min-h-28">
                            {`curl \\
	-X GET "${data.apiUrl}" \\
	-H "x-api-key: ${apiKeyValue || displayApiKey(apiKey?.keySuffix)}"`}
                          </Pre>
                        </TabsContent>
                        <TabsContent value="nodejs">
                          <Pre>
                            {`const axios = require('axios');

axios.get('${data.apiUrl}', {
  headers: {
    'x-api-key': '${apiKeyValue || displayApiKey(apiKey?.keySuffix)}'
  }
})
.then(response => {
  console\.log(response.data);
})
.catch(error => {
  console\.error('Error:', error);
});`}
                          </Pre>
                        </TabsContent>
                        <TabsContent value="python">
                          <Pre>
                            {`import requests

url = "${data.apiUrl}"
headers = {
    "x-api-key": "${apiKeyValue || displayApiKey(apiKey?.keySuffix)}"
}

response = requests.get(url, headers=headers)
print(response.json())`}
                          </Pre>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                )}
              </Await>
            </Suspense>
          </CardContent>
        </Card>
      </SectionContent>
    </Section>
  );
}
