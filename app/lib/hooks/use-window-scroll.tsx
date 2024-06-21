import { useLayoutEffect, useEffect, useState } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Replace useWindowScroll with a custom implementation
export const useWindowScroll = () => {
  const [scroll, setScroll] = useState({ x: 0, y: 0 });

  useIsomorphicLayoutEffect(() => {
    const handleScroll = () => {
      setScroll({ x: window.scrollX, y: window.scrollY });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return [scroll];
};
