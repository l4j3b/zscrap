import { capitalize } from 'lodash-es';
import { Moon, Sun, SunMoon } from 'lucide-react';
import { Theme, useTheme } from 'remix-themes';

import { Button, ButtonProps } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

const THEMES = [Theme.LIGHT, Theme.DARK, null];

export function ThemeToggle({
  variant = 'link',
  size = 'icon',
}: {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}) {
  const [theme, setTheme, { definedBy }] = useTheme();
  const resolvedTheme = definedBy === 'SYSTEM' ? null : theme;

  const toggleTheme = () => {
    const currentThemeIndex = THEMES.indexOf(resolvedTheme);
    const nextTheme = THEMES[(currentThemeIndex + 1) % THEMES.length];

    setTheme(nextTheme);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={variant} size={size} onClick={() => toggleTheme()}>
            <div>
              {resolvedTheme === 'dark' && <Moon className="size-5" />}
              {resolvedTheme === 'light' && <Sun className="size-5" />}
              {resolvedTheme === null && <SunMoon className="size-5" />}
            </div>
          </Button>
        </TooltipTrigger>

        <TooltipContent>{capitalize(resolvedTheme || 'system')}</TooltipContent>
      </Tooltip>
    </>
  );
}
