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
			<Component {...pageProps} />
			<img src="https://i.travelapi.com/lodging/11000000/10140000/10130300/10130300/c9095011_z.jpg" />
		</>
	)
}
