import { useState, useCallback } from 'react';

function useMultiToggle<T>(values: T[], initialValue?: T): [T, () => void] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('useMultiToggle requires an array of values with at least one element');
  }

  const initialIndex = initialValue !== undefined ? values.indexOf(initialValue) : 0;

  if (initialIndex === -1) {
    throw new Error('Initial value must be one of the values in the array');
  }

  const [index, setIndex] = useState(initialIndex);

  const toggle = useCallback(() => {
    setIndex((prevIndex) => (prevIndex + 1) % values.length);
  }, [values.length]);

  return [values[index], toggle];
}

export default useMultiToggle;
