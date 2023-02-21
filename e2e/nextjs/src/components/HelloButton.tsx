'use client'

import { useState } from 'react'

export default function HelloButton() {
	const [hello, setHello] = useState<string>()
	return (
		<div style={{ display: 'flex' }}>
			<button
				onClick={async () => {
					const r = await fetch('/api/hello')
					const data = await r.text()
					setHello(data)
				}}
			>
				Hello!
			</button>
			<p>{hello}</p>
		</div>
	)
}
