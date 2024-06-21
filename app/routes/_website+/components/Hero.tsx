import { Link } from '@remix-run/react';
import { $path } from 'remix-routes';

import { BackgroundGradientAnimation } from '~/components/ui/background-gradient-animation';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

export default function Hero() {
  return (
    <section
      className={`
        relative mx-4 flex min-h-[60vh] flex-col items-center justify-center overflow-hidden
        rounded-md p-8
      `}
    >
      <div className="absolute inset-0 z-[-1] backdrop-blur">
        <BackgroundGradientAnimation />
      </div>

      <div>
        <h1
          className={cn(`
            text-center text-3xl font-extrabold !leading-[2] text-white transition-all
            bg-[length:200%_1000%]
            sm:text-5xl
          `)}
        >
          Scraping made eaZy!
        </h1>
      </div>

      <p className={`mt-12 text-center text-2xl tracking-wide text-white/80`}>
        {
          "Build scrapers without coding, selectors, or extensions, just tell us what you're looking for."
        }
      </p>

      <div className={`mt-16`}>
        <Link to={$path('/auth/sign-up', { redirect: $path('/in/scrapers/new') })}>
          <Button size={`lg`} variant={`outline`} className={`border-0 bg-white text-black`}>
            Get Started
          </Button>
        </Link>
      </div>
    </section>
  );
}
