import { ErrorButtons } from '@/app/components/error-buttons'
import { FetchTests } from '@/app/components/fetch-tests'
import Image from 'next/image'
import { PathButtons } from '@/app/components/path-buttons'
import { TrpcQueries } from '@/app/components/trpc-queries'

export default function Home() {
	return (
		<main
			style={{
				padding: '2rem',
			}}
		>
			<Image
				alt="Highlight logo"
				src="highlight/logo-and-text-on-dark.svg"
				width={167}
				height={33}
				priority
				style={{ marginBottom: '4rem' }}
			/>

			<div style={{ display: 'flex', flexWrap: 'wrap', gridGap: '2rem' }}>
				<div>
					<h3>Error Buttons</h3>
					<ErrorButtons />
				</div>

				<div>
					<h3>Paths</h3>
					<PathButtons />
				</div>

				<div>
					<h3>Fetch</h3>
					<FetchTests />
				</div>

				<div>
					<h3>tRPC</h3>
					<TrpcQueries />
				</div>
			</div>
		</main>
	)
}
