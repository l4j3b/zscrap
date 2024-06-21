import type { ActionFunction } from '@remix-run/cloudflare';
import { useFetcher } from '@remix-run/react';
import { useState, useEffect } from 'react';
import type { z, ZodSchema } from 'zod';

export function createUseActionHook<A extends ActionFunction, S extends ZodSchema>(
  actionPath: string,
  schema: S,
) {
  return function useAction() {
    const fetcher = useFetcher<A>();
    const [promise, setPromise] = useState<{
      resolve: (_data: typeof fetcher.data) => void;
      reject: (_error: string) => void;
    } | null>(null);

    const submitting = fetcher.state === 'submitting';
    const loading = fetcher.state !== 'idle';

    const submit = async (data: z.infer<S>) => {
      fetcher.submit(data, {
        method: 'POST',
        action: actionPath,
      });

      return new Promise<typeof fetcher.data>((resolve, reject) => {
        setPromise({ resolve, reject });
      });
    };

    useEffect(() => {
      if (!promise || submitting) return;

      promise.resolve(fetcher.data);
      setPromise(null);

      return () => {
        if (promise) {
          promise.resolve(fetcher.data);
        }
      };
    }, [submitting, promise, fetcher.data]);

    return {
      ...fetcher,
      actionPath,
      submit,
      submitting,
      schema,
      loading,
    };
  };
}
