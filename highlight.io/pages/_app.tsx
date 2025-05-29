import Router from 'next/router'
import nProgress from 'nprogress'

import '../styles/globals.scss'
import '../styles/nprogress.css'
import '../styles/public.css'

import { SpeedInsights } from '@vercel/speed-insights/next'
import { H } from 'highlight.run'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Analytics from '../components/Analytics'
import { Meta } from '../components/common/Head/Meta'
import MetaImage from '../public/images/meta-image.jpg'
import { ErrorBoundary as HighlightErrorBoundary } from '@highlight-run/next/client'
import { initialize } from '@launchdarkly/js-client-sdk'
import Observability from '@launchdarkly/observability'
import SessionReplay from '@launchdarkly/session-replay'
import { useEffect, useMemo } from 'react'

Router.events.on('routeChangeStart', nProgress.start)
Router.events.on('routeChangeError', nProgress.done)
Router.events.on('routeChangeComplete', () => {
	if (window.rudderanalytics) {
		window.rudderanalytics?.page()
	}

	nProgress.done()
})

function MyApp({ Component, pageProps }: AppProps) {
	const client = useMemo(() => {
		return initialize(
			process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_SIDE_ID!,
			{
				// Not including plugins at all would be equivalent to the current LaunchDarkly SDK.
				plugins: [
					new Observability(
						process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
						{
							networkRecording: {
								enabled: true,
								recordHeadersAndBody: true,
							},
							serviceName: 'web',
						},
					),
					new SessionReplay(
						process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
						{
							privacySetting: 'none',
							serviceName: 'web',
						},
					),
				],
			},
		)
	}, [])
	return (
		<HighlightErrorBoundary showDialog>
			<Head>
				<link
					rel="preconnect"
					href="https://fonts.googleapis.com"
				></link>

				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Meta
				title="highlight.io: The open source monitoring platform."
				description="highlight.io is the open source monitoring platform that gives you the visibility you need."
				absoluteImageUrl={`https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}${MetaImage.src}`}
			/>
			<Component {...pageProps} />
			<SpeedInsights />
			<Analytics />
		</HighlightErrorBoundary>
	)
}

export default MyApp
