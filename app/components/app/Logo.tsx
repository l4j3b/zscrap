import { Link } from '@remix-run/react';
import { twMerge } from 'tailwind-merge';

import { config } from '~/config';

import { GradientText } from './GradientText';

interface LogoProps {
  to?: string;
  className?: string;
  hideText?: boolean;
}

export function Logo({ to, className, hideText }: LogoProps) {
  // split first letter of name
  const name = config.app.name;
  const firstLetter = name.charAt(0);
  const restOfName = name.slice(1);

  const content = (
    <span className={twMerge('inline-flex items-center', className)}>
      <GradientText className="flex items-center text-4xl font-semibold">✨</GradientText>

      {/* <span
        className={twMerge(
          'bg-accent-foreground bg-clip-text text-3xl font-semibold text-transparent',
          className,
        )}
      >
        ✨
      </span> */}
      {!hideText && (
        <span className="ml-1.5 inline font-mono text-2xl text-accent-foreground">
          <span className="font-black">{firstLetter}</span>
          <span className="font-thin">{restOfName}</span>
        </span>
      )}
    </span>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

/*
<img
	src="/assets/logo/logo.png"
	alt="Logo"
	style={{
		width: 52,
		height: 52,
		objectFit: "contain",
	}}
/>
*/
