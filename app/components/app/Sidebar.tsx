import { NavLink, useLocation, useNavigate } from '@remix-run/react';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { cn } from '~/lib/utils';

interface SidebarItemProps {
  children: ReactNode;
  to: string;
  end?: boolean;
}

interface SidebarProps {
  groups: {
    title?: string;
    items: SidebarItemProps[];
  }[];
}

const SidebarItem = ({ children, to, end }: SidebarItemProps) => (
  <li className="mb-1">
    <NavLink end={end} to={to} prefetch="intent">
      {({ isActive }) => (
        <Button
          tabIndex={-1}
          variant={'ghost'}
          size={'sm'}
          className={cn('w-full justify-start text-muted-foreground', {
            'text-accent-foreground': isActive,
          })}
        >
          <div className="w-full text-left text-sm uppercase tracking-wider">{children}</div>
        </Button>
      )}
    </NavLink>
  </li>
);

export function Sidebar({ groups }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const mobileMenu = (
    <div className={`w-full px-2 pb-5 pt-2`}>
      <Select
        value={location.pathname}
        onValueChange={(to) => {
          navigate(to);
        }}
      >
        <SelectTrigger className="h-14 w-full px-5 text-lg">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {groups.map(({ title, items }, index) => (
            <SelectGroup key={title || index}>
              {title && (
                <SelectLabel
                  className={cn('text-sm font-bold uppercase', {
                    'mt-4': index !== 0,
                  })}
                >
                  {title}
                </SelectLabel>
              )}

              {items?.map((item, index) => (
                <SelectItem
                  key={index}
                  value={item.to}
                  className="h-14 text-base text-foreground/80"
                >
                  {item.children}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const sidebarItems = groups.map(({ title, items }, index) => (
    <div key={title || index}>
      {title && (
        <li
          className={cn('mb-4 ml-3 text-sm font-bold uppercase', {
            'mt-8': index !== 0,
          })}
        >
          {title}
        </li>
      )}

      {items?.map((item, index) => <SidebarItem key={index} {...item} />)}
    </div>
  ));

  const styles = twMerge('w-60');

  return (
    <>
      <div className="md:hidden">
        <div className={twMerge('fixed left-0 right-0 z-10')}>{mobileMenu}</div>
        <div className={twMerge('pointer-events-none opacity-0')}>{mobileMenu}</div>
      </div>

      <div
        className={`
          p-4 pr-0 pt-px
          max-md:hidden
        `}
      >
        <ul className={twMerge(styles, 'fixed z-10')}>{sidebarItems}</ul>
        <ul className={twMerge(styles, 'pointer-events-none opacity-0')}>{sidebarItems}</ul>
      </div>
    </>
  );
}
