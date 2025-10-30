
import React, { useState, useEffect } from 'react';

/**
 * Custom React hook for syncing state with browser localStorage
 * 
 * Automatically serializes/deserializes values as JSON and handles:
 * - Migration from plain strings to JSON format
 * - Parse errors with fallback to initial value
 * - Cross-tab synchronization via storage events
 * 
 * @template T - The type of the stored value
 * @param key - The localStorage key to use
 * @param initialValue - Default value if no stored value exists
 * @returns A stateful value and setter function, similar to useState
 * 
 * @example
 * const [name, setName] = useLocalStorage<string>('username', 'Guest');
 * const [bookings, setBookings] = useLocalStorage<Booking[]>('bookings', []);
 */
function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      // Migration: if value looks like a plain string (e.g., en) and not JSON, coerce it
      const looksLikePlainString = typeof item === 'string' && item.length > 0 && !item.trim().startsWith('{') && !item.trim().startsWith('[') && !item.trim().startsWith('"');
      if (looksLikePlainString) {
        console.warn(`localStorage item "${key}" appears to be a plain string, not JSON:`, item);
        // Decide what to store based on expected type
        const valueToUse = (typeof (initialValue as any) === 'string') ? (item as any as T) : initialValue;
        // Normalize storage to JSON to avoid future parse errors
        try { window.localStorage.setItem(key, JSON.stringify(valueToUse)); } catch {}
        return valueToUse;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing localStorage item "${key}":`, error);
      console.error('Raw value:', window.localStorage.getItem(key));
      // On parse error, reset to initial and normalize storage
      try { window.localStorage.setItem(key, JSON.stringify(initialValue)); } catch {}
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          if (e.newValue === null) {
            setStoredValue(initialValue);
            return;
          }
          const val = e.newValue;
          const looksLikePlainString = typeof val === 'string' && val.length > 0 && !val.trim().startsWith('{') && !val.trim().startsWith('[') && !val.trim().startsWith('"');
          if (looksLikePlainString) {
            const valueToUse = (typeof (initialValue as any) === 'string') ? (val as any as T) : initialValue;
            try { window.localStorage.setItem(key, JSON.stringify(valueToUse)); } catch {}
            setStoredValue(valueToUse);
          } else {
            setStoredValue(JSON.parse(val));
          }
        } catch (error) {
          console.error("Error parsing localStorage change for key:", key, error);
          setStoredValue(initialValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
