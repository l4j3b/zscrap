import { useRevalidator } from '@remix-run/react';
import { useState, useCallback } from 'react';
import { useInterval } from 'usehooks-ts';

export function useLivePageData(delay = 10000): { start: () => void; stop: () => void } {
  const revalidator = useRevalidator();
  const [isRunning, setIsRunning] = useState(false);

  useInterval(
    () => {
      if (revalidator.state === 'idle' && isRunning) {
        revalidator.revalidate();
      }
    },
    isRunning ? delay : null,
  );

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  return { start, stop };
}
