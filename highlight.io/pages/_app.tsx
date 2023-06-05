import Router from 'next/router'
import nProgress from 'nprogress'

import '../styles/globals.scss'
import '../styles/nprogress.css'
import '../styles/public.css'

import { H } from 'highlight.run'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import { SSRProvider } from 'react-aria'
import { Meta } from '../components/common/Head/Meta'
import MetaImage from '../public/images/meta-image.jpg'
import { rudderInitialize } from '../scripts/rudder-initialize'
import { setAttributionData } from '../utils/attribution'
export { reportWebVitals } from 'next-axiom'

Router.events.on('routeChangeStart', nProgress.start)
Router.events.on('routeChangeError', nProgress.done)
Router.events.on('routeChangeComplete', () => {
	if (window.rudderanalytics) {
		window.rudderanalytics?.page()
	}

	nProgress.done()
})

H.init('<YOUR_PROJECT_ID>', {
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
	tracingOrigins: true,
})

function MyApp({ Component, pageProps }: AppProps) {
	useEffect(() => {
		const initialize = async () => {
			const ref = setAttributionData()

			await rudderInitialize()
			window.rudderanalytics?.page()
			window.rudderanalytics?.identify(
				ref.clientID,
				ref as unknown as { [k: string]: string },
			)
		}

		initialize()
	}, [])

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
				absoluteImageUrl={`https://${process.env.NEXT_PUBLIC_VERCEL_URL}${MetaImage.src}`}
			/>
			<Component {...pageProps} />
		</SSRProvider>
	)
}

export default MyApp
