// pages/_app.tsx
import { H } from '@highlight-run/next/client'
import { AppProps } from 'next/app'
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
