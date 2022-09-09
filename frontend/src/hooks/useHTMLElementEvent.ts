import { useEffect } from 'react'

export function useHTMLElementEvent<T extends keyof HTMLElementEventMap>(
	element: HTMLElement | null | undefined,
	event: T,
	handler: (this: HTMLElement, ev: HTMLElementEventMap[T]) => any,
	options?: AddEventListenerOptions,
) {
	useEffect(() => {
		if (!element) return
		element.addEventListener(event, handler, options)
		return () => {
			element.removeEventListener(event, handler, options)
		}
	})
}
