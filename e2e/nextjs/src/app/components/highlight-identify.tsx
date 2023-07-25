'use client'

import { H } from '@highlight-run/next/client'
import { useEffect } from 'react'

export function HighlightIdentify() {
	useEffect(() => {
		H.identify('chris.esplin@highlight.io', {
			highlightDisplayName: 'Chris Esplin',
			accountType: 'fake',
			hasUsedFeature: true,
		})
	}, [])

	return null
}
