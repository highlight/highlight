'use client'

import React, { useCallback, useRef, useState } from 'react'
import { H } from '@highlight-run/next/client'

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
	}, [])

	const start = useCallback(() => {
		if (!interval.current) {
			interval.current = setInterval(update, 100) as unknown as number
		}
		return stop
	}, [stop, update])

	const forceNew = useCallback(() => {
		console.log('stopping session')
		H.stop()
		console.log('starting new session')
		H.start({ forceNew: true })
		console.log('started new session')
	}, [])

	return (
		<div>
			<p>Hello: {value}</p>
			<button onClick={start}>start</button>
			<button onClick={stop}>stop</button>
			<button onClick={forceNew}>force new session</button>
		</div>
	)
}
