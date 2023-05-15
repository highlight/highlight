// pages/_app.tsx
import { AppProps } from 'next/app'
import CONSTANTS from '@/app/constants'
import { HighlightInit } from '@highlight-run/next/highlight-init'

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<HighlightInit
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true,
					urlBlocklist: [],
				}}
				backendUrl={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL}
			/>

			<Component {...pageProps} />
		</>
	)
}
