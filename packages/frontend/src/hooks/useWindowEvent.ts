import { useEffect } from 'react'

export function useWindowEvent<T extends keyof WindowEventMap>(
	event: T,
	handler: (this: Window, ev: WindowEventMap[T]) => any,
	options?: AddEventListenerOptions,
) {
	useEffect(() => {
		window.addEventListener(event, handler, options)
		return () => {
			window.removeEventListener(event, handler, options)
		}
	})
}
