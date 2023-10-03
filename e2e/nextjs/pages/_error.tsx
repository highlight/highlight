// pages/_error.tsx
import NextError from 'next/error'
import {
	H,
	getHighlightErrorInitialProps,
	HighlightErrorProps,
} from '@highlight-run/next/client'
import CONSTANTS from '@/app/constants'

export default function CustomError({
	errorMessage,
	statusCode,
}: HighlightErrorProps) {
	H.init(CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID)
	H.consumeError(new Error(errorMessage))

	return <NextError statusCode={statusCode} /> // Render default Next error page
}

CustomError.getInitialProps = getHighlightErrorInitialProps
