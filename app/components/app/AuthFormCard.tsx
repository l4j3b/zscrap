import { ReactNode } from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '~/components/ui/card';
import { Icons } from '~/components/ui/icons';

import { Logo } from './Logo';

interface AuthFormCardProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

export const AuthFormCardGoogleButton = ({
  text,
  handleGoogleAuth,
  loading = false,
}: {
  text: string;
  handleGoogleAuth: () => void;
  loading?: boolean;
}) => (
  <Button className="w-full" onClick={handleGoogleAuth} size="lg" loading={loading}>
    <Icons.google className="mr-4 size-5" />
    {text}
  </Button>
);

export const AuthFormCardSeparator = () => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-card px-2 text-muted-foreground">Or</span>
    </div>
  </div>
);

export function AuthFormCard({ title, description, children, footer }: AuthFormCardProps) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center align-middle">
      <div className="w-full min-w-72 max-w-lg space-y-10">
        <div className="ml-2 mr-7 flex items-center text-3xl">
          <Logo />
        </div>

        <Card>
          <CardHeader className="px-10 pb-6 pt-10">
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription className="space-y-4 pt-8">{description}</CardDescription>
            )}
          </CardHeader>

          {children && <CardContent className="space-y-12 p-10 pt-0">{children}</CardContent>}
        </Card>

        {footer && <div className="space-y-4 p-4 text-center">{footer}</div>}
      </div>
    </div>
  );
}
