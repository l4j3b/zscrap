import { forwardRef, HTMLAttributes } from 'react';

import { cn } from '~/lib/utils';

const Section = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div className={`m-2 mt-0 flex flex-1 flex-col`}>
      <div
        ref={ref}
        className={cn(
          `relative flex h-full flex-1 flex-col overflow-hidden rounded-md border bg-card/80`,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  ),
);
Section.displayName = 'Section';

const SectionHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          `
            left-0 right-0 top-0 z-10 flex h-16 flex-row items-center px-6 pr-3 pt-2 transition-all
            sm:pt-3
          `,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SectionHeader.displayName = 'SectionHeader';

const SectionTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        `flex items-center py-4 text-xl font-semibold leading-none text-foreground`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
SectionTitle.displayName = 'SectionTitle';

const SectionDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-3 text-sm text-muted-foreground', className)} {...props} />
  ),
);
SectionDescription.displayName = 'SectionDescription';

const SectionContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`relative flex flex-1 overflow-visible transition-all`}>
      <div
        className={cn(
          `
            absolute inset-0 z-10 flex-1 flex-col space-y-4 overflow-auto px-2 py-2
            sm:px-3 sm:py-3
          `,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  ),
);
SectionContent.displayName = 'SectionContent';

const SectionFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mx-4 flex items-center pb-4', className)} {...props} />
  ),
);
SectionFooter.displayName = 'SectionFooter';

export { Section, SectionHeader, SectionFooter, SectionTitle, SectionDescription, SectionContent };
