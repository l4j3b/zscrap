import { defer, LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { eq } from 'drizzle-orm';

import { organizationsTable } from 'drizzle/schema';
import { Badge } from '~/components/ui/badge';
import { Section, SectionContent, SectionHeader, SectionTitle } from '~/components/ui/section';
import { config } from '~/config';
import { useActiveOrg } from '~/routes/_app+/_layout';

import { OrganizationDetails } from './components/OrganizationDetails';
import { OrganizationUsers } from './components/OrganizationUsers';

export const meta: MetaFunction = () => {
  return [{ title: `Organization - ${config.app.name}` }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { activeOrganizationId, sessionUserId } = context.getSession();

  // TODO: remove users for member
  const organization = context.db.query.organizationsTable
    .findFirst({
      where: eq(organizationsTable.id, activeOrganizationId),
      with: {
        usersToOrganizations: {
          with: {
            user: true,
          },
        },
      },
    })
    .then((organization) => {
      if (!organization) {
        return null;
      }

      return {
        ...organization,
        role: organization.usersToOrganizations.find((uto) => uto.userId === sessionUserId)?.role,
      };
    });

  return defer({ organization, sessionUserId });
}

export default function OrganizationRoute() {
  const { activeOrg } = useActiveOrg();

  return (
    <Section>
      <SectionHeader>
        <SectionTitle className="flex items-center">
          Organization
          {activeOrg?.role && (
            <Badge variant={'outline'} className="ml-3">
              {activeOrg.role}
            </Badge>
          )}
        </SectionTitle>
      </SectionHeader>

      <SectionContent>
        <OrganizationDetails />
        <OrganizationUsers />
      </SectionContent>
    </Section>
  );
}
