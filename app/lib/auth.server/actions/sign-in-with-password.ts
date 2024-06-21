import type { AppLoadContext } from '@remix-run/cloudflare';

import { OrganizationRoles } from 'drizzle/schema';
import { findUserById } from '~/lib/db.server/queries/find-user';

import { setAuthSession } from '../utils/set-auth-session';

export async function signInWithPassword({
  context,
  email,
  password,
}: {
  context: AppLoadContext;
  email: string;
  password: string;
}) {
  const {
    data: { user: supabaseUser },
    error,
  } = await context.supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!supabaseUser?.id || !supabaseUser?.email) {
    throw new Error('Invalid email or password');
  }

  const dbUser = await findUserById(context.db, supabaseUser.id);

  const activeOrganization = dbUser?.usersToOrganizations.find(
    (uto) => uto.role === OrganizationRoles.Owner,
  );

  if (!dbUser || !activeOrganization) {
    throw new Error('User retrieving user.');
  }

  setAuthSession(context, {
    sessionUserId: supabaseUser.id,
    email: supabaseUser.email,
    displayName: dbUser.displayName,
    username: dbUser.username,
    isAdmin: dbUser.isAdmin,
    whitelisted: dbUser.whitelisted,
    activeOrganizationId: activeOrganization.organizationId,
  });
}
