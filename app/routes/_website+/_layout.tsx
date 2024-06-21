import { Outlet } from '@remix-run/react';
import { $path } from 'remix-routes';

import { Navbar } from '~/components/app/Navbar';
import { ThemeToggle } from '~/components/app/ThemeToggle';

import Footer from './components/Footer';

const WebsiteLayout = () => {
  return (
    <div className="absolute left-0 right-0 top-0 z-10 flex flex-col">
      {/* <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">
          <p className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/80 to-white/20">
            Gradients X Animations
          </p>
        </div> */}

      <Navbar
        className="container relative"
        logoHref={$path('/')}
        right={
          <>
            <ThemeToggle />
            {/* Not using an NavLink here to trigger a full reload of the page/server request */}
            <a href={$path('/in')}>Sign in</a>
          </>
        }
      />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

export default WebsiteLayout;
