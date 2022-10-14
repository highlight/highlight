import { MutableRefObject, useCallback, useRef } from 'react'

export type MapOrEntries<K, V> = Map<K, V> | [K, V][]

type Return<K, V> = [
	MutableRefObject<Omit<Map<K, V>, 'set' | 'clear' | 'delete'>>,
	(key: K, value: V) => void,
	(entries: [K, V | undefined][]) => void,
	(key: K) => void,
	Map<K, V>['clear'],
]

function useMapRef<K, V>(
	initialState: MapOrEntries<K, V> = new Map(),
): Return<K, V> {
	const mapRef = useRef(new Map(initialState))

	const set = useCallback((key: K, value: V) => {
		mapRef.current.set(key, value)
	}, [])

	const setMulti = useCallback((entries: [K, V | undefined][]) => {
		for (const [k, v] of entries) {
			if (v === undefined) {
				mapRef.current.delete(k)
			} else {
				mapRef.current.set(k, v)
			}
		}
	}, [])

	const remove = useCallback((key: K) => {
		mapRef.current.delete(key)
	}, [])

	const reset = useCallback(() => {
		mapRef.current = new Map()
	}, [])

	return [mapRef, set, setMulti, remove, reset]
}

export default useMapRef
