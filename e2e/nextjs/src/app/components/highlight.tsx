'use client'

import { H, HighlightOptions } from 'highlight.run'

import { useEffect } from 'react'

interface Props extends HighlightOptions {
	projectId?: string
}

export function Highlight({ projectId, ...highlightOptions }: Props) {
	useEffect(() => {
		projectId && H.init(projectId, highlightOptions)
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return null
}
