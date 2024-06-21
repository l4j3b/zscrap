import { type AppLoadContext } from '@remix-run/cloudflare';
import { eq } from 'drizzle-orm';

import { OrganizationRoles, usersTable, usersToOrganizations } from 'drizzle/schema';

export async function setActiveOrg(context: AppLoadContext, organizationId: string | null) {
  const session = context.getSession();
  let newOrgId = organizationId;

  if (!newOrgId) {
    // retrieve the user's organization
    const user = await context.db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.sessionUserId),
      with: {
        usersToOrganizations: {
          with: { organization: true },
          where: eq(usersToOrganizations.role, OrganizationRoles.Owner),
        },
      },
    });

    if (!user || !user.usersToOrganizations?.[0]?.organization.id) {
      throw new Error('User is not a member of any organizations.');
    }

    newOrgId = user.usersToOrganizations[0]?.organization.id;
  }

  context.setSession({
    ...session,
    activeOrganizationId: newOrgId,
  });
}
