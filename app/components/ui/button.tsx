import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '~/lib/utils';

const buttonVariants = cva(
  `
    flex items-center justify-center whitespace-nowrap rounded-lg text-center font-medium
    tracking-wide ring-offset-background transition duration-300
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/0
    focus-visible:ring-offset-2
  `,
  {
    variants: {
      variant: {
        default: `
          brand-gradient-primary border text-white transition-all
          dark:text-foreground
        `,
        secondary: `brand-gradient-secondary border bg-background text-foreground transition-all`,
        destructive: `
          border border-destructive bg-destructive/0 text-destructive
          dark:bg-destructive/10 dark:hover:bg-destructive/25
          hover:bg-destructive/10
        `,
        outline: `
          border bg-input text-foreground/80
          hover:bg-muted/70 hover:text-accent-foreground
        `,
        ghost: `
          text-muted-foreground
          disabled:text-muted-foreground/50
          hover:bg-muted hover:text-accent-foreground
        `,

        link: `
          text-muted-foreground
          hover:text-accent-foreground
        `,
      },
      size: {
        sm: 'h-10',
        default: 'h-11',
        lg: 'h-12',
        'icon-sm': 'size-10',
        icon: 'size-11',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const buttonVariantsInner = cva(
  `
    flex flex-1 items-center justify-center
    disabled:cursor-not-allowed disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        default: ``,
        secondary: ``,
        destructive: ``,
        outline: ``,
        ghost: ``,
        link: ``,
      },
      size: {
        sm: 'px-2 py-1',
        default: 'px-4 py-2',
        lg: 'px-8 py-3',
        'icon-sm': '',
        icon: '',
        'icon-lg': '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  innerClassName?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      innerClassName,
      variant = 'default',
      size,
      type = 'button',
      loading = false,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <span className={cn('relative', buttonVariants({ variant, size, className }))}>
        <Comp
          ref={ref}
          disabled={loading || props.disabled}
          type={type}
          // style={{
          // 	textShadow:
          // 		variant === "default" ? "0px -1px 0px #0000003d" : undefined,
          // }}
          className={cn(buttonVariantsInner({ variant, size, className: innerClassName }))}
          // className="flex items-center"
          {...props}
          style={{
            opacity: loading ? 0 : 'unset',
          }}
        >
          {children}
        </Comp>

        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: loading ? 1 : 0,
            pointerEvents: loading ? 'auto' : 'none',
          }}
        >
          <Loader2
            className="size-4 animate-spin"
            style={{
              transition: 'width 0.3s, margin-right 0.3s',
              width: loading ? undefined : 0,
              // marginRight: loading ? '0.5rem' : 0,
            }}
          />
        </span>
      </span>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
