import { useState, useEffect } from 'react';

/**
 * Debounce a value by a given delay (default: 300ms)
 * Usage: const debouncedSearch = useDebounce(searchTerm, 300);
 */
export default function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
