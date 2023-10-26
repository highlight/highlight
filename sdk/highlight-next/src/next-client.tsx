'use client'

import React, { useEffect } from 'react'
import { HighlightOptions, H as localH } from 'highlight.run'
import type { NextPageContext } from 'next'
import NextError from 'next/error'

import { ErrorProps } from 'next/error'

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

export type PageRouterErrorProps = HighlightErrorProps

export function pageRouterCustomErrorHandler(
	highlightInitProps: Props,
	Child?: React.FC<HighlightErrorProps>,
) {
	const { projectId, ...highlightOptions } = highlightInitProps

	const handler = (props: HighlightErrorProps) => {
		localH.init(projectId, highlightOptions)
		localH.consumeError(new Error(props.errorMessage))

		return Child ? <Child {...props} /> : <NextError {...props} />
	}

	handler.getInitialProps = getHighlightErrorInitialProps

	return handler
}

export type AppRouterErrorProps = {
	error: Error & { digest?: string }
	reset: () => void
}

export function appRouterSsrErrorHandler(Child: React.FC<AppRouterErrorProps>) {
	return ({ error, reset }: AppRouterErrorProps) => {
		useEffect(() => {
			localH.consumeError(error)
		}, [error])

		return <Child error={error} reset={reset} />
	}
}
