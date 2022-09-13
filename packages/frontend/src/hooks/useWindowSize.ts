import { useEffect, useState } from 'react'

const getSize = () =>
	typeof window !== 'undefined'
		? { width: window.innerWidth, height: window.innerHeight }
		: { width: 0, height: 0 }

export function useWindowSize() {
	const [size, setSize] = useState(getSize)

	useEffect(() => {
		const handleResize = () => setSize(getSize)
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	})

	return size
}
