import { TiVendorMicrosoft } from 'react-icons/ti';

import { AuthFormCard } from '~/components/app/AuthFormCard';
import { Button } from '~/components/ui/button';
import { Icons } from '~/components/ui/icons';
import { config } from '~/config';

export default function AuthForgotPasswordSuccess() {
  return (
    <AuthFormCard
      title={'Reset password'}
      description={
        <>
          <p>
            Thanks! An email with reset password instructions has been sent, please make sure to
            check your spam folder.
          </p>

          <p>
            If you don&apos;t get an email, please contact us at:{' '}
            <a
              href={`mailto:${config.app.contact}`}
              rel="noopener noreferrer"
              target="_blank"
              className="underline"
            >
              {config.app.contact}
            </a>
          </p>

          <div className="flex gap-4 pt-4">
            <a
              href="https://mail.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full" variant={'outline'} size={'icon-lg'}>
                <Icons.google className="size-5" />
              </Button>
            </a>

            <a
              href="https://mail.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full" variant={'outline'} size={'icon-lg'}>
                <Icons.apple className="size-5" />
              </Button>
            </a>

            <a
              href="https://outlook.office.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full" variant={'outline'} size={'icon-lg'}>
                <TiVendorMicrosoft className="size-5" />
              </Button>
            </a>
          </div>
        </>
      }
    />
  );
}
