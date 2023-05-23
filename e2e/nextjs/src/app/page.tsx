import { ErrorButtons } from '@/app/components/error-buttons'
import Image from 'next/image'
import { PathButtons } from '@/app/components/path-buttons'
import { TrpcQueries } from '@/app/components/trpc-queries'

export default function Home() {
	return (
		<main style={{ padding: '2rem' }}>
			<Image
				alt="Highlight logo"
				src="highlight/logo-and-text-on-dark.svg"
				width={167}
				height={33}
				priority
			/>

			<h3>Error Buttons</h3>

			<ErrorButtons />

			<h3>Paths</h3>
			<PathButtons />

			<h3>tRPC</h3>
			<TrpcQueries />
		</main>
	)
}
