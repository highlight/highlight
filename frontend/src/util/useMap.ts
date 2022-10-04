import { timedCall } from '@util/perf/instrument'
import { useCallback, useState } from 'react'

export type MapOrEntries<K, V> = Map<K, V> | [K, V][]

type Return<K, V> = [
	Omit<Map<K, V>, 'set' | 'clear' | 'delete'>,
	(key: K, value: V) => void,
	(entries: [K, V | undefined][]) => void,
	(key: K) => void,
	Map<K, V>['clear'],
]

function useMap<K, V>(
	initialState: MapOrEntries<K, V> = new Map(),
): Return<K, V> {
	const [map, setMap] = useState(new Map(initialState))

	const set = useCallback((key: K, value: V) => {
		timedCall('useMap/set', () => {
			setMap((prev) => {
				return timedCall('useMap/set/copy', () => {
					const copy = new Map(prev)
					copy.set(key, value)
					return copy
				})
			})
		})
	}, [])

	const setMulti = useCallback((entries: [K, V | undefined][]) => {
		timedCall('useMap/setMulti', () => {
			setMap((prev) => {
				return timedCall('useMap/setMulti/copy', () => {
					const copy = new Map(prev)
					for (const [k, v] of entries) {
						if (v === undefined) {
							copy.delete(k)
						} else {
							copy.set(k, v)
						}
					}
					return copy
				})
			})
		})
	}, [])

	const remove = useCallback((key: K) => {
		timedCall('useMap/remove', () => {
			setMap((prev) => {
				return timedCall('useMap/remove/copy', () => {
					const copy = new Map(prev)
					copy.delete(key)
					return copy
				})
			})
		})
	}, [])

	const reset = useCallback(() => {
		timedCall('useMap/reset', () => {
			setMap(() => new Map())
		})
	}, [])

	return [map, set, setMulti, remove, reset]
}

export default useMap
