'use client'

import { H, HighlightOptions } from 'highlight.run'

import { useEffect } from 'react'

interface Props extends HighlightOptions {
	projectId?: string
}

export function HighlightInit({ projectId, ...highlightOptions }: Props) {
	useEffect(() => {
		console.log(
			'H.init call inside <HighlightInit />',
			projectId,
			highlightOptions,
		)
		projectId && H.init(projectId, highlightOptions)
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return null
}
