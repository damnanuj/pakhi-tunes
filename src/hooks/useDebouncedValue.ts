import { useEffect, useRef, useState } from "react";

/**
 * Returns a value that updates only after `delayMs` of no changes to `value`.
 * Updates always go through the timer (never sync on the same render as `value` changes).
 */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const latestValue = useRef(value);
  latestValue.current = value;

  useEffect(() => {
    if (delayMs <= 0) {
      setDebouncedValue(value);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedValue(latestValue.current);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
