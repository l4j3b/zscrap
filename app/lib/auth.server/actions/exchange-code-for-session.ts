import { type AppLoadContext } from '@remix-run/cloudflare';

import { OrganizationRoles } from 'drizzle/schema';
import { createUser } from '~/lib/db.server/queries/create-user';
import { findUserById } from '~/lib/db.server/queries/find-user';

import { ADMIN_EMAILS, WHITELISTED_EMAILS } from '../config';
import { generateUsername } from '../utils/generate-username';
import { getDisplayName } from '../utils/get-display-name';
import { setAuthSession } from '../utils/set-auth-session';

export async function exchangeCodeForSession({
  context,
  code,
}: {
  context: AppLoadContext;
  code?: string | null;
}) {
  if (!code) {
    throw new Error('No code provided');
  }

  const {
    data: { user: supabaseUser },
    error,
  } = await context.supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw new Error(error.message);
  }

  if (!supabaseUser?.id || !supabaseUser?.email) {
    throw new Error('Invalid email or password');
  }

  // Retrieve user from the db.
  let dbUser = await findUserById(context.db, supabaseUser.id);

  console.log('dbUser', dbUser);

  if (!dbUser) {
    console.log('creating user');

    // Determine if the new user is whitelisted or an admin.
    const whitelisted = WHITELISTED_EMAILS.includes(supabaseUser.email);
    const isAdmin = ADMIN_EMAILS.includes(supabaseUser.email);

    // Create the user if it doesn't exist.
    await createUser(context.db, {
      id: supabaseUser.id,
      email: supabaseUser.email,
      username: generateUsername(),
      displayName: getDisplayName(supabaseUser.email),
      whitelisted,
      isAdmin,
    });

    // Retrieve the newly created user.
    dbUser = await findUserById(context.db, supabaseUser.id);

    if (!dbUser) {
      throw new Error('Failed to create user.');
    }
  }

  // Get the active organization id (default to the first organization the user owns, there should always be at least one).
  const activeOrganizationId = dbUser?.usersToOrganizations.find(
    (uto) => uto.role === OrganizationRoles.Owner,
  )?.organizationId;

  if (!activeOrganizationId) {
    throw new Error('User does not have an active organization.');
  }

  return setAuthSession(context, {
    sessionUserId: supabaseUser.id,
    email: supabaseUser.email,
    displayName: dbUser.displayName,
    username: dbUser.username,
    isAdmin: dbUser.isAdmin,
    whitelisted: dbUser.whitelisted,
    activeOrganizationId,
  });
}
