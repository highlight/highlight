import { useCallback, useEffect, useState } from 'react'

export const useMediaQuery = (width: number) => {
	const [targetReached, setTargetReached] = useState(false)

	const updateTarget = useCallback((e: any) => {
		if (e.matches) {
			setTargetReached(true)
		} else {
			setTargetReached(false)
		}
	}, [])

	useEffect(() => {
		const media = window.matchMedia(`(max-width: ${width}px)`)
		media.addEventListener('change', (e) => updateTarget(e))

		// Check on mount (callback is not called until a change occurs)
		if (media.matches) {
			setTargetReached(true)
		}

		return () => media.removeEventListener('change', (e) => updateTarget(e))
	}, [width, updateTarget])

	return targetReached
}
