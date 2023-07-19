// src/app/layout.tsx
import './globals.css'

import CONSTANTS from '@/app/constants'
import { HighlightInit } from '@highlight-run/next/highlight-init'

export const metadata = {
	title: 'Highlight Next Demo',
	description: 'Check out how Highlight works with Next.js',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<HighlightInit
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true,
				}}
				// inlineImages={false}
				backendUrl={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL}
				scriptUrl={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_SCRIPT_URL}
			/>

			<html lang="en">
				<body>
					<div>{children}</div>
				</body>
			</html>
		</>
	)
}
