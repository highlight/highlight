// pages/_app.tsx
import { AppProps } from 'next/app'
import CONSTANTS from '@/app/constants'
import { H } from 'highlight.run'
import { HighlightInit } from '@highlight-run/next/highlight-init'
import { useEffect } from 'react'

export default function MyApp({ Component, pageProps }: AppProps) {
	useEffect(() => {
		H.identify('chris.esplin@highlight.io', {
			highlightDisplayName: 'Chris Esplin',
			accountType: 'fake',
			hasUsedFeature: true,
		})
	}, [])

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
				// inlineImages={true} // Set to false to disable inline images and resolve CORS issue
				// run `yarn dev` from the sdk/client directory to serve the scriptUrl
				// scriptUrl="http://localhost:8080/dist/index.js"
				backendUrl={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL}
			/>

			<Component {...pageProps} />

			<img src="https://i.travelapi.com/lodging/11000000/10140000/10130300/10130300/c9095011_z.jpg" />
		</>
	)
}
