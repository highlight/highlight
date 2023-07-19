import { H } from 'highlight.run'
import type { HighlightOptions } from 'highlight.run'
import React, { useEffect } from 'react'

interface Props extends HighlightOptions {
	projectId?: string
}

export function HighlightInit({ projectId, ...highlightOptions }: Props) {
	useEffect(() => {
		projectId && H.init(projectId, highlightOptions)
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return null
}
