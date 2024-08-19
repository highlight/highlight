import Router from 'next/router'
import nProgress from 'nprogress'

import '../styles/globals.scss'
import '../styles/nprogress.css'
import '../styles/public.css'

import { SpeedInsights } from '@vercel/speed-insights/next'
import { H } from 'highlight.run'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { SSRProvider } from 'react-aria'
import Analytics from '../components/Analytics'
import { Meta } from '../components/common/Head/Meta'
import MetaImage from '../public/images/meta-image.jpg'

Router.events.on('routeChangeStart', nProgress.start)
Router.events.on('routeChangeError', nProgress.done)
Router.events.on('routeChangeComplete', () => {
	if (window.rudderanalytics) {
		window.rudderanalytics?.page()
	}

	nProgress.done()
})

H.init('4d7k1xeo', {
	inlineStylesheet: true,
	inlineImages: true,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
	tracingOrigins: true,
})

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<SSRProvider>
			<Head>
				<title>
					highlight.io: The open source monitoring platform.
				</title>

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
		</SSRProvider>
	)
}

export default MyApp
