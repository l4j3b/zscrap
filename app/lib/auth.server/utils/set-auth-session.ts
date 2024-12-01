import { type AppLoadContext } from '@remix-run/cloudflare';

export function setAuthSession(
  context: AppLoadContext,
  {
    whitelisted = false,
    sessionUserId,
    displayName,
    username,
    email,
    isAdmin,
    activeOrganizationId,
  }: {
    whitelisted: boolean;
    sessionUserId: string;
    displayName: string;
    username: string;
    email: string;
    isAdmin: boolean;
    activeOrganizationId: string;
  },
) {
  // // If the user is whitelisted, don't set the session
  if (!whitelisted) {
    context.destroySession();

    throw new Error('waitlisted');
  } else {
    // Set auth session
    context.setSession({
      sessionUserId,
      displayName,
      username,
      email,
      isAdmin,
      activeOrganizationId,
    });
  }
}
