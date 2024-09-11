import { HighlightOptions, H as localH } from 'highlight.run'
import type { NextPageContext } from 'next'
import NextError, { ErrorProps } from 'next/error.js'
import React, { useEffect } from 'react'

export { ErrorBoundary } from '@highlight-run/react'
export { localH as H }

export interface HighlightInitProps extends HighlightOptions {
	projectId?: string
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
	highlightInitProps: HighlightInitProps,
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
