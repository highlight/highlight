import { MutableRefObject, useCallback, useRef } from 'react'

export type MapOrEntries<K, V> = Map<K, V> | [K, V][]

type Return<K, V> = [
	MutableRefObject<Omit<Map<K, V>, 'set' | 'clear' | 'delete'>>,
	(key: K, value: V) => void,
	(key: K) => void,
	Map<K, V>['clear'],
]

// unlike useMap, useMapRef does not implement setMulti since it is synchronous,
// and there is no advantage to provide more than one k,v pair per set call
function useMapRef<K, V>(
	initialState: MapOrEntries<K, V> = new Map(),
): Return<K, V> {
	const mapRef = useRef(new Map(initialState))

	const set = useCallback((key: K, value: V) => {
		mapRef.current.set(key, value)
	}, [])

	const remove = useCallback((key: K) => {
		mapRef.current.delete(key)
	}, [])

	const reset = useCallback(() => {
		mapRef.current = new Map()
	}, [])

	return [mapRef, set, remove, reset]
}

export default useMapRef
