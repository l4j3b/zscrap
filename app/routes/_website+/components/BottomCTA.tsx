import { Link } from '@remix-run/react';
import { $path } from 'remix-routes';

import { Button } from '~/components/ui/button';

export default function BottomCTA() {
  return (
    <section className="py-24">
      <div className={`m-auto flex max-w-6xl flex-1 flex-col items-center justify-center p-8`}>
        <h2
          className={`
            mt-12 text-center text-2xl font-semibold text-muted-foreground
            dark:text-foregrounds
          `}
        >
          Ready to get started?
        </h2>

        <div className={`mb-16 mt-16`}>
          <Link to={$path('/auth/sign-up', { redirect: $path('/in/scrapers/new') })}>
            <Button size={`lg`}>Try it for free!</Button>
          </Link>

          <p className={`mt-8 text-center text-muted-foreground`}>
            Free credits to get you started.
          </p>
        </div>
      </div>
    </section>
  );
}
