'use client'

import React, { useCallback, useEffect, useState } from 'react'

export const Random = () => {
	const [value, setValue] = useState<string>()

	const update = useCallback(() => {
		setValue(`Hello: ${Math.random()}`)
	}, [])

	useEffect(() => {
		const id = setInterval(update, 100)
		return () => clearInterval(id)
	}, [update])

	return <p>{value}</p>
}
