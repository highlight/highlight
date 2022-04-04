import { useCallback, useState } from 'react';

export type MapOrEntries<K, V> = Map<K, V> | [K, V][];

// Public interface
export interface Actions<K, V> {
    set: (key: K, value: V) => void;
    setAll: (entries: MapOrEntries<K, V>) => void;
    remove: (key: K) => void;
    reset: Map<K, V>['clear'];
}

// We hide some setters from the returned map to disable autocompletion
type Return<K, V> = [
    Omit<Map<K, V>, 'set' | 'clear' | 'delete'>,
    // Actions<K, V>
    (key: K, value: V) => void,
    (entries: MapOrEntries<K, V>) => void,
    (key: K) => void,
    Map<K, V>['clear']
];

function useMap<K, V>(
    initialState: MapOrEntries<K, V> = new Map()
): Return<K, V> {
    const [map, setMap] = useState(new Map(initialState));

    const set = useCallback((key, value) => {
        setMap((prev) => {
            const copy = new Map(prev);
            copy.set(key, value);
            return copy;
        });
    }, []);

    const setAll = useCallback((entries) => {
        setMap(() => new Map(entries));
    }, []);

    const remove = useCallback((key) => {
        setMap((prev) => {
            const copy = new Map(prev);
            copy.delete(key);
            return copy;
        });
    }, []);

    const reset = useCallback(() => {
        setMap(() => new Map());
    }, []);

    // const actions = useCallback(() => {
    //     return {
    //         set,
    //         setAll,
    //         remove,
    //         reset,
    //     };
    // }, [remove, reset, set, setAll])();

    return [map, set, setAll, remove, reset];
}

export default useMap;
