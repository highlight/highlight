import CONSTANTS from '@/app/constants'
import { ErrorButtons } from '@/app/components/error-buttons'
import { Highlight } from '@/app/components/highlight'
import Image from 'next/image'

export default function Home() {
	return (
		<>
			<Highlight projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID} />

			<main style={{ padding: '2rem' }}>
				<Image
					alt="Highlight logo"
					src="highlight/logo-and-text-on-dark.svg"
					width={167}
					height={33}
					priority
				/>

				<ErrorButtons />
			</main>
		</>
	)
}
