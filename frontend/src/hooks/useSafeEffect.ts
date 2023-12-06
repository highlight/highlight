import { MutableRefObject, useEffect, useRef } from 'react'

type Callback = (isMountedRef: MutableRefObject<boolean>) => any

export function useSafeEffect(callback: Callback, memoArray: any[]) {
	const isMountedRef = useRef<boolean>(true)

	useEffect(() => {
		const unmount = callback(isMountedRef)

		isMountedRef.current = true

		return () => {
			isMountedRef.current = false

			typeof unmount === 'function' && unmount()
		}
	}, memoArray) // eslint-disable-line react-hooks/exhaustive-deps
}
