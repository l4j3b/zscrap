import { Link } from '@remix-run/react';
import { $path } from 'remix-routes';

import { Pre } from '~/components/app/Pre';
import { Card, CardContent } from '~/components/ui/card';
import { Section, SectionContent, SectionHeader, SectionTitle } from '~/components/ui/section';
import { config } from '~/config';

export default function Route() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Thank you for your purchase!</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <Card>
          <CardContent className="space-y-3 pt-3">
            <div> You can now start using your product. </div>

            <div>
              You can manage your invoices in your account{' '}
              <Link to={$path('/in/account/billing')} className="primary">
                billing
              </Link>{' '}
              section.
            </div>

            <div>If your encounter any issues, please you can contact us at: </div>

            <div className="py-3">
              <Pre>
                <a href={`mailto:${config.company.contact}`} target="_blank" rel="noreferrer">
                  {config.company.contact}
                </a>
              </Pre>
            </div>

            <div>
              <Link to="/in" className="primary">
                Go back to the app
              </Link>
            </div>
          </CardContent>
        </Card>
      </SectionContent>
    </Section>
  );
}
