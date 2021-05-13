import { useEffect, useState } from 'react';

const useMedia = <T>(queries: string[], values: T[], defaultValue: T) => {
    // Array containing a media query list for each query
    const mediaQueryLists = queries.map((q) => window.matchMedia(q));
    // Function that gets value based on matching media query
    const getValue = () => {
        // Get index of first media query that matches
        const index = mediaQueryLists.findIndex((mql) => mql.matches);
        // Return related value or defaultValue if none
        return values?.[index] || defaultValue;
    };
    // State and setter for matched value
    const [value, setValue] = useState<T>(getValue);
    useEffect(
        () => {
            // Event listener callback
            // Note: By defining getValue outside of useEffect we ensure that it has ...
            // ... current values of hook args (as this hook callback is created once on mount).
            const handler = () => setValue(getValue);
            // Set a listener for each media query with above handler as callback.
            mediaQueryLists.forEach((mql) =>
                mql.addEventListener('change', handler)
            );
            // Remove listeners on cleanup
            return () =>
                mediaQueryLists.forEach((mql) =>
                    mql.removeEventListener('change', handler)
                );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Empty array ensures effect is only run on mount and unmount
    );
    return value;
};

export default useMedia;
