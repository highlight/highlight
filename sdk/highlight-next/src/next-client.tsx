'use client'

import { H as localH, HighlightOptions } from 'highlight.run'

export { localH as H }

import { useEffect } from 'react'

export interface Props extends HighlightOptions {
	projectId?: string
}

export function HighlightInit({ projectId, ...highlightOptions }: Props) {
	useEffect(() => {
		projectId && localH.init(projectId, highlightOptions)
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return null
}
