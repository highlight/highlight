'use client'

import { H } from '@highlight-run/next/client'
import { useEffect } from 'react'

export default function HighlightIdentify() {
	useEffect(() => {
		H.identify('chris.esplin@highlight.io', {
			highlightDisplayName: 'Chris "Highlight" Esplin',
			accountType: 'fake',
			host: window.location.host,
			hasUsedFeature: true,
		})
	}, [])

	return <h1>H.identify() called from /pages/h-identify.tsx</h1>
}
