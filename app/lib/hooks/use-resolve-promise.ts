import localforage from 'localforage';
import { useState, useEffect } from 'react';

type PromiseState = 'loading' | 'fulfilled' | 'rejected' | 'idle';

const inMemoryCache = new Map<string, unknown>();

interface UseResolvePromiseResult<T> {
  result: T | undefined;
  error: Error | null;
  state: PromiseState;
  loading: boolean;
}

function useResolvePromise<T>(
  promise: Promise<T> | T | undefined,
  cacheKey?: string,
): UseResolvePromiseResult<T> {
  const [result, setResult] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [state, setState] = useState<PromiseState>('idle');

  useEffect(() => {
    const fetchCachedData = async () => {
      if (cacheKey && typeof result === 'undefined') {
        let cachedData = inMemoryCache.get(cacheKey);

        if (!cachedData) {
          cachedData = await localforage.getItem(cacheKey);
        }

        if (cachedData) {
          setResult(cachedData as T);
        }
      }
    };

    fetchCachedData();
  }, [cacheKey]);

  useEffect(() => {
    // Reset state if the promise is undefined or changes
    if (!promise) {
      setResult(undefined);
      setError(null);
      setState('idle');

      return;
    }

    if (promise instanceof Promise) {
      setState('loading');
      setError(null);

      if (!cacheKey) {
        setResult(undefined);
      }

      const handleResolve = (result: T) => {
        setResult(result);
        setState('fulfilled');

        if (cacheKey) {
          inMemoryCache.set(cacheKey, result);
          localforage.setItem(cacheKey, result);
        }
      };

      const handleReject = (error: Error) => {
        setError(error);
        setState('rejected');
      };

      promise.then(handleResolve).catch(handleReject);
    } else {
      setResult(promise);
      setState('fulfilled');

      if (cacheKey) {
        inMemoryCache.set(cacheKey, result);
        localforage.setItem(cacheKey, promise);
      }
    }
  }, [cacheKey, promise, result]);

  return {
    result,
    error,
    state,
    loading: state === 'loading' || typeof result === 'undefined',
  };
}

export { useResolvePromise };
