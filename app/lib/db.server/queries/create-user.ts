import {
  OrganizationRoles,
  organizationsTable,
  usersTable,
  usersToOrganizations,
} from 'drizzle/schema';

import { DbClient } from '../initialize-db-client';

export async function createUser(
  db: DbClient,
  {
    id,
    email,
    username,
    displayName,
    whitelisted,
    isAdmin,
  }: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    whitelisted: boolean;
    isAdmin: boolean;
  },
) {
  const result = await db.transaction(async (tx) => {
    const userResult = await tx
      .insert(usersTable)
      .values({
        id,
        email,
        username,
        displayName,
        whitelisted,
        isAdmin,
      })
      .onConflictDoNothing()
      .returning();

    const dbUser = userResult[0];

    // Create the organization
    const organizationResult = await tx
      .insert(organizationsTable)
      .values({
        name: `${username}'s org`,
      })
      .returning();

    const organization = organizationResult[0];

    // Associate the user with the organization
    await tx.insert(usersToOrganizations).values({
      userId: dbUser.id,
      organizationId: organization.id,
      role: OrganizationRoles.Owner,
    });

    return { dbUser, organization };
  });

  return result;
}
