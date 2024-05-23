'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

export const Random = () => {
	const [value, setValue] = useState<number>(0)
	const interval = useRef<number>(0)

	const update = useCallback(async () => {
		const r = await fetch(`/_next/static/chunks/app/page.js`)
		const data = await r.arrayBuffer()
		setValue((v) => v + data.byteLength * Math.random())
	}, [])

	const stop = useCallback(() => {
		if (interval.current) {
			clearInterval(interval.current)
			interval.current = 0
		}
	}, [update])

	const start = useCallback(() => {
		if (!interval.current) {
			interval.current = setInterval(update, 100) as unknown as number
		}
		return stop
	}, [update])

	return (
		<div>
			<p>Hello: {value}</p>
			<button onClick={start}>start</button>
			<button onClick={stop}>stop</button>
		</div>
	)
}
