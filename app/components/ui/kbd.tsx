import { ReactNode } from 'react';

const Kbd = ({ children }: { children: ReactNode }) => (
  <>
    <kbd
      className={`
        pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted
        px-1.5 font-mono font-medium text-muted-foreground opacity-100
      `}
    >
      {children}
    </kbd>
  </>
);

Kbd.displayName = 'Kbd';

export { Kbd };
