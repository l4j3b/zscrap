import { ComponentProps } from 'react';
import { useTheme } from 'remix-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme] = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="group"
      toastOptions={{
        classNames: {
          toast:
            'p-6 group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg border-2 brand-gradient-secondary',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: 'reset-brand-gradient-secondary',
          warning: 'reset-brand-gradient-secondary',
          error: 'reset-brand-gradient-secondary',
          info: 'reset-brand-gradient-secondary',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
