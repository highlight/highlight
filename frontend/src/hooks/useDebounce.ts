import { useEffect, useRef, useState } from 'react'

export function useDebounce<T>(value: T, delay?: number) {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)
	const timeout = useRef<NodeJS.Timeout>(undefined)

	useEffect(() => {
		timeout.current = setTimeout(() => {
			setDebouncedValue(value)
		}, delay || 300)

		return () => {
			if (timeout.current) {
				clearTimeout(timeout.current)
			}
		}
	}, [value, delay])

	return {
		debouncedValue,
		setDebouncedValue,
	}
}
