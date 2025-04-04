/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, useState } from 'react'

import { useSafeEffect } from './useSafeEffect'

export interface Options {
	millis?: number
	leading?: boolean
	initializeValue?: boolean
}

export function useDebouncedValue<T>(
	value: T,
	{ initializeValue = true, leading = false, millis = 300 }: Options = {},
) {
	return leading
		? useLeadingDebounce<T>(value, { millis })
		: useTrailingDebounce<T>(value, { initializeValue, millis })
}

function useLeadingDebounce<T>(value: T, { millis }: { millis: number }) {
	const blockedRef = useRef<boolean>(undefined)
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useSafeEffect(
		(isMountedRef) => {
			if (isMountedRef.current && !blockedRef.current) {
				blockedRef.current = true

				setDebouncedValue(value)

				setTimeout(() => {
					blockedRef.current = false
				}, millis)
			}
		},
		[millis, value],
	)

	return debouncedValue
}

function useTrailingDebounce<T>(
	value: T,
	{ initializeValue, millis }: { initializeValue: boolean; millis: number },
) {
	const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
	const [debouncedValue, setDebouncedValue] = useState<T | undefined>(
		initializeValue ? value : undefined,
	)

	useSafeEffect(
		(isMountedRef) => {
			timerRef.current && clearTimeout(timerRef.current)

			timerRef.current = setTimeout(
				() => isMountedRef.current && setDebouncedValue(value),
				millis,
			)
		},
		[millis, value],
	)

	return debouncedValue
}
