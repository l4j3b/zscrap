import { AppLoadContext } from '@remix-run/cloudflare';
import { eq } from 'drizzle-orm';

import { OrganizationRoles, usersTable } from 'drizzle/schema';

import { DbClient } from '../initialize-db-client';

export function findUserById(db: DbClient, id: string) {
  return db.query.usersTable.findFirst({
    where: eq(usersTable.id, id),
    with: {
      usersToOrganizations: {
        with: { organization: true },
      },
    },
  });
}

type UserWithOrgs = Awaited<ReturnType<typeof findUserById>>;

export const resolveSessionUser = async (context: AppLoadContext) => {
  return findUserById(context.db, context.sessionUserId);
};

export function resolveUserOrgRole(user: UserWithOrgs, organizationId: string) {
  const uto = user?.usersToOrganizations.find((uto) => uto.organizationId === organizationId);

  const isOrgOwner = uto?.role === OrganizationRoles.Owner;
  const isOrgAdmin = uto?.role === OrganizationRoles.Admin;

  return {
    role: uto?.role,
    isOrgOwner,
    isOrgAdmin,
  };
}

export const requireOrgAdmin = (user: UserWithOrgs, organizationId: string) => {
  const { isOrgAdmin, isOrgOwner } = resolveUserOrgRole(user, organizationId);

  if (!isOrgAdmin && !isOrgOwner) {
    throw new Error('Unauthorized');
  }
};

export const requireOrgOwner = (user: UserWithOrgs, organizationId: string) => {
  const { isOrgOwner } = resolveUserOrgRole(user, organizationId);

  if (!isOrgOwner) {
    throw new Error('Unauthorized');
  }
};

export function findUserByEmail(db: DbClient, email: string) {
  return db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });
}
