'use client'

import { HighlightOptions, H as localH } from 'highlight.run'
import type { NextPageContext } from 'next'

import { ErrorProps } from 'next/error'

import { useEffect } from 'react'

export { localH as H }
export { ErrorBoundary } from '@highlight-run/react'

export interface Props extends HighlightOptions {
	excludedHostnames?: string[]
	projectId?: string
}

export function HighlightInit({
	excludedHostnames = [],
	projectId,
	...highlightOptions
}: Props) {
	useEffect(() => {
		const shouldRender =
			projectId &&
			excludedHostnames.every(
				(hostname) => !window.location.hostname.includes(hostname),
			)

		shouldRender && localH.init(projectId, highlightOptions)
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return null
}

export type HighlightErrorProps = { errorMessage: string } & ErrorProps

export function getHighlightErrorInitialProps({
	res,
	err,
}: NextPageContext): HighlightErrorProps {
	const statusCode = res?.statusCode ?? err?.statusCode ?? 500
	const errorMessage =
		res?.statusMessage ?? err?.message ?? 'An error occurred'

	return { errorMessage, statusCode }
}
