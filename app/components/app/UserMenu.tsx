import { Link, useNavigate } from '@remix-run/react';
import { Settings, CreditCard, LogOut, Building2, User, Lock } from 'lucide-react';
import { useEffect } from 'react';
import { $path } from 'remix-routes';

import { OrganizationRoles } from 'drizzle/schema';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useActiveOrg } from '~/routes/_app+/_layout';
import { useSignOutAction } from '~/routes/auth+/sign-out';

import { Loader } from './Loader';

interface UserMenuProps {
  displayName?: string;
  username?: string;
}

export function UserMenu({ displayName, username }: UserMenuProps) {
  const { activeOrg } = useActiveOrg();
  const navigate = useNavigate();
  const signOut = useSignOutAction();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.ctrlKey) {
        switch (event.key) {
          case 'P':
            navigate($path('/in/account/profile'));
            break;
          case 'O':
            navigate($path('/in/account/organization'));
            break;
          case 'Q':
            signOut.submit({});
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (!displayName || !username) {
    return null;
  }

  const avatar = username === 'j3b' ? '/assets/avatar.png' : undefined;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="size-10 cursor-pointer">
            <AvatarImage src={avatar} alt={displayName} />
            <AvatarFallback>{displayName?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <Link to={$path('/in/account/profile')} prefetch="intent">
            <DropdownMenuItem className="items-start align-top font-normal">
              <User className="mr-3 mt-1 size-4" />
              <div className="flex flex-col space-y-1">
                <p className="font-medium">{displayName}</p>
                <p className="text-xs font-medium leading-none opacity-60">{username}</p>
              </div>
              <DropdownMenuShortcut>⌃⇧P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <Link to={$path('/in/account/organization')} prefetch="intent">
              <DropdownMenuItem>
                <Building2 className="mr-3 size-4" />
                Organization
                <DropdownMenuShortcut>⌃⇧O</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>

            <Link to={$path('/in/account/billing')} prefetch="intent">
              <DropdownMenuItem>
                <CreditCard className="mr-3 size-4" />
                Billing
              </DropdownMenuItem>
            </Link>

            {activeOrg?.role === OrganizationRoles.Owner && (
              <Link to={$path('/in/account/api')} prefetch="intent">
                <DropdownMenuItem>
                  <Lock className="mr-3 size-4" />
                  API
                </DropdownMenuItem>
              </Link>
            )}

            <Link to={$path('/in/account/settings')} prefetch="intent">
              <DropdownMenuItem>
                <Settings className="mr-3 size-4" />
                Settings
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => signOut.submit({})}>
            <LogOut className="mr-3 size-4" />
            Sign out
            <DropdownMenuShortcut>⌃⇧Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Loader
        loading={signOut.loading}
        blocking
        className={`fixed inset-0 h-[100vh] w-[100vw]`}
        background
      />
    </>
  );
}
