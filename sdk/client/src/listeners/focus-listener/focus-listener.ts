import { getElementSelector } from '../../utils/dom'

export const FocusListener = (callback: (targetSelector: string) => void) => {
	const recordFocus = (event: FocusEvent) => {
		if (event.target) {
			const targetSelector = getElementSelector(event.target as Element)
			callback(targetSelector)
		}
	}
	window.addEventListener('focusin', recordFocus)
	return () => window.removeEventListener('focusin', recordFocus)
}
