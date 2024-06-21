import { defer, LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';
import { Outlet, useLoaderData, useRouteLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { $path, $routeId } from 'remix-routes';
import { toast } from 'sonner';

import { findUserById } from '~/lib/db.server/queries/find-user';
import { useResolvePromise } from '~/lib/hooks/use-resolve-promise';

export interface AppLoggedInData {
  user: Awaited<ReturnType<typeof findUserById>>;
  session: {
    isAdmin: boolean;
    displayName: string;
    username: string;
    email: string;
    activeOrganizationId: string | null;
  };
}

export async function loader({ context }: LoaderFunctionArgs) {
  // TODO: Double check: Not necessary to check if user is authenticated as the server does it.
  if (!context.sessionUserId) {
    return redirect($path('/auth/sign-in'));
  }

  const { sessionUserId, isAdmin, displayName, username, email, activeOrganizationId } =
    context.getSession();

  const user = findUserById(context.db, sessionUserId).then((user) => user);

  return defer({
    user,
    session: {
      isAdmin,
      displayName,
      username,
      email,
      activeOrganizationId,
    },
    errorMessage: context.readFlashMessage('errorMessage'),
    infoMessage: context.readFlashMessage('infoMessage'),
    successMessage: context.readFlashMessage('successMessage'),
  });
}

export default function GlobalLayout() {
  const { errorMessage, infoMessage, successMessage } = useLoaderData<typeof loader>();

  useEffect(() => {
    errorMessage?.message && toast.error(errorMessage.message);
  }, [errorMessage?.id, errorMessage?.message]);

  useEffect(() => {
    successMessage?.message && toast.success(successMessage.message);
  }, [successMessage?.id, successMessage?.message]);

  useEffect(() => {
    infoMessage?.message && toast.info(infoMessage.message);
  }, [infoMessage?.id, infoMessage?.message]);

  return (
    <>
      <Outlet />
    </>
  );
}

const routeId = $routeId('routes/_app+/_layout');

export const useAppLoaderData = () => {
  const data = useRouteLoaderData<typeof loader>(routeId);
  const { result: user, loading } = useResolvePromise(data?.user, 'app_layout_user');

  const activeOrg = user?.usersToOrganizations.find(
    ({ organizationId }) => organizationId === data?.session?.activeOrganizationId,
  );

  return {
    user,
    activeOrg,
    loading,
    session: data?.session,
  };
};

export const useActiveUser = () => {
  const { user, loading } = useAppLoaderData();

  return { user, loading };
};

export const useActiveOrg = () => {
  const { activeOrg, loading } = useAppLoaderData();

  return { activeOrg, loading };
};

export const useUserSession = () => {
  const { session, loading } = useAppLoaderData();

  return { session, loading };
};
