import { createContext, useContext, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'; // Adjust the import path as necessary
import { ButtonProps } from '~/components/ui/button';

interface ConfirmContextProps {
  openConfirm: (_config: ConfirmConfig) => Promise<boolean>;
}

interface ConfirmConfig {
  title: string;
  description: string;
  okText?: string;
  okType?: ButtonProps['variant'];
  cancelText?: string;
  onConfirm?: () => void;
}

const ConfirmContext = createContext<ConfirmContextProps | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<((_value: boolean) => void) | null>(null);
  const [loading, setLoading] = useState(false);

  const openConfirm = (config: ConfirmConfig): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmConfig(config);
      setResolvePromise(() => resolve);
      setOpen(true);
    });
  };

  const closeConfirm = (result: boolean) => {
    if (resolvePromise) {
      resolvePromise(result);
    }

    setOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ openConfirm }}>
      {children}
      {confirmConfig &&
        createPortal(
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{confirmConfig.title}</AlertDialogTitle>
                <AlertDialogDescription>{confirmConfig.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => closeConfirm(false)} disabled={loading}>
                  {confirmConfig.cancelText || 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction
                  asChild
                  variant={confirmConfig.okType}
                  loading={loading}
                  onClick={async (e) => {
                    e.preventDefault();

                    if (confirmConfig.onConfirm) {
                      setLoading(true);
                      await confirmConfig.onConfirm();
                      setLoading(false);
                      closeConfirm(true);
                    } else {
                      closeConfirm(true);
                    }
                  }}
                >
                  {confirmConfig.okText || 'Continue'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmProvider');
  }

  return context.openConfirm;
}
