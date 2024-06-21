import type { AppLoadContext } from '@remix-run/cloudflare';

import { createUser } from '~/lib/db.server/queries/create-user';

import { ADMIN_EMAILS, WHITELISTED_EMAILS } from '../config';
import { generateUsername } from '../utils/generate-username';
import { getDisplayName } from '../utils/get-display-name';
import { setAuthSession } from '../utils/set-auth-session';

export async function signUpWithPassword({
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
  } = await context.supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!supabaseUser || !supabaseUser?.id) {
    throw new Error('Invalid email or password.');
  }

  const whitelisted = WHITELISTED_EMAILS.includes(email);
  const isAdmin = ADMIN_EMAILS.includes(email);
  const username = generateUsername();
  const displayName = getDisplayName(email);

  const result = await createUser(context.db, {
    id: supabaseUser.id,
    email,
    username,
    displayName,
    whitelisted,
    isAdmin,
  });

  const { dbUser, organization } = result;

  if (!dbUser) {
    throw new Error('An account with that email already exists. Please sign in instead.');
  }

  setAuthSession(context, {
    whitelisted,
    sessionUserId: supabaseUser.id,
    email,
    displayName,
    username,
    isAdmin,
    activeOrganizationId: organization.id,
  });
}
