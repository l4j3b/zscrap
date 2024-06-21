import { Link, NavLink } from '@remix-run/react';
import { Menu } from 'lucide-react'; // Importing icons for the hamburger menu
import { ReactNode, useState } from 'react';
import { $path } from 'remix-routes';

import { Button } from '~/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet';
// import { useWindowScroll } from '~/lib/hooks/use-window-scroll';
import { cn } from '~/lib/utils';

import { Logo } from './Logo';

interface NavbarItemProps {
  to: string;
  children: React.ReactNode;
  end?: boolean;
  onClick?: () => void;
}

interface NavbarProps {
  className?: string;
  logoHref?: string;
  left?: ReactNode;
  right?: ReactNode;
  items?: NavbarItemProps[];
  hideLogoText?: boolean;
}

export const NavbarItem = ({ children, to, end = true, onClick }: NavbarItemProps) => (
  <NavLink end={end} to={to} className="mr-2 w-full" prefetch="intent">
    {({ isActive }) => (
      <Button
        tabIndex={-1}
        variant={'link'}
        size={'sm'}
        onClick={onClick}
        className={cn('w-full justify-start text-muted-foreground', {
          'text-accent-foreground': isActive,
        })}
      >
        <div className="w-full text-left text-sm uppercase tracking-wider">{children}</div>
      </Button>
    )}
  </NavLink>
);

export function Navbar({
  logoHref = $path('/in'),
  left,
  className,
  items,
  right,
  hideLogoText = false,
}: NavbarProps) {
  // const [{ y }] = useWindowScroll();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navbarItems = items?.map((item, index) => (
    <NavbarItem key={index} {...item} onClick={() => setIsDrawerOpen(false)} />
  ));

  const navbarContent = (
    <div
      className={`
        sticky flex w-full items-center justify-between px-4 py-4 transition-all
        sm:px-5
      `}
    >
      <div className={`flex items-center`}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`
              mr-4
              md:hidden
            `}
          >
            <Menu className="size-6" />
          </Button>
        </SheetTrigger>

        <Link
          to={logoHref}
          className={`
            mr-4 hidden items-center
            md:flex
          `}
        >
          <Logo hideText={hideLogoText} />
        </Link>

        <div>{left}</div>

        <div
          className={`
            hidden
            md:flex
          `}
        >
          {navbarItems}
        </div>
      </div>

      <div className={`flex items-center space-x-4`}>{right}</div>
    </div>
  );

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <div className={cn('sticky inset-x-0 left-0 right-0 top-0 z-10', className)}>
        <div
          className={cn(
            'border-transparent transition-colors duration-300',
            // {
            //   'border-border': (y || 0) > 0,
            // },
          )}
        >
          {navbarContent}
        </div>
      </div>

      <SheetContent side="left" className="w-4/5">
        <SheetHeader className="flex justify-between">
          <SheetTitle className="hidden"></SheetTitle>
          <Link to={logoHref} className={`mr-7 flex items-center`}>
            <Logo />
          </Link>
        </SheetHeader>

        <div className="mt-8 flex flex-1 flex-col justify-between">
          <div className="mt-4 flex w-full flex-col">{navbarItems}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
