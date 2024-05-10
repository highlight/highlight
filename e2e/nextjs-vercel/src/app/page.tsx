/* eslint-disable @next/next/no-img-element */
import { ErrorButtons } from '@/app/components/error-buttons'
import { LogButtons } from '@/app/components/log-buttons'
import { HighlightIdentify } from '@/app/components/highlight-identify'
import { HighlightButtons } from './components/highlight-buttons'
import Image from 'next/image'
import Link from 'next/link'
import { PathButtons } from '@/app/components/path-buttons'

export default function Home() {
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

			<h3>Fetch</h3>

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
		</main>
	)
}
