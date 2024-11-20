/* eslint-disable @next/next/no-img-element */
import { Canvas } from '@/app/components/canvas'
import { ErrorButtons } from '@/app/components/error-buttons'
import { FetchTests } from '@/app/components/fetch-tests'
import { HighlightIdentify } from '@/app/components/highlight-identify'
import { LogButtons } from '@/app/components/log-buttons'
import { PathButtons } from '@/app/components/path-buttons'
import { Random } from '@/app/components/random'
import { TrpcQueries } from '@/app/components/trpc-queries'
import logger from '@/highlight.logger'
import Image from 'next/image'
import Link from 'next/link'
import { HighlightButtons } from './components/highlight-buttons'
import { PrismaQueries } from '@/app/components/prisma-queries'

export default function Home() {
	logger.info({}, `Home page component`)
	return (
		<main style={{ padding: '2rem' }}>
			<HighlightIdentify />

			<Image
				alt="Highlight logo"
				src="highlight/logo-and-text-on-dark.svg"
				width={167}
				height={33}
				priority
			/>

			<h3>H Buttons</h3>
			<HighlightButtons />

			<h3>Log Buttons</h3>
			<LogButtons />

			<h3>Error Buttons</h3>
			<ErrorButtons />

			<h3>Paths</h3>
			<PathButtons />

			<h3>tRPC</h3>
			<TrpcQueries />

			<h3>Fetch</h3>
			<FetchTests />

			<h3>Prisma</h3>
			<PrismaQueries />

			<div style={{ paddingBottom: '1rem', paddingTop: '1rem' }}>
				<a href="/server-actions" style={{ color: 'white' }}>
					Server Actions
				</a>
			</div>

			<Link href="/another-page">Navigation Test</Link>
			<Image
				alt="cross origin test"
				height={200}
				width={200}
				src="https://i.travelapi.com/lodging/11000000/10140000/10130300/10130300/c9095011_z.jpg"
			/>
			<img
				alt="test"
				height={200}
				width={200}
				src="https://i.travelapi.com/lodging/11000000/10140000/10130300/10130300/c9095011_z.jpg"
			/>

			<h3 style={{ paddingTop: '1em' }}>Random</h3>
			<Random />

			<h3>Canvas</h3>
			<Canvas engineOptions={{ preserveDrawingBuffer: true }} />
		</main>
	)
}
