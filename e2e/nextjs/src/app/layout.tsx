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
				debug={{ clientInteractions: true, domRecording: true }}
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true,
				}}
				// inlineImages={false}
				enableCanvasRecording={true}
				samplingStrategy={{
					canvas: 1,
					canvasMaxSnapshotDimension: 480,
					canvasFactor: 0.5,
					canvasClearWebGLBuffer: true,
					canvasInitialSnapshotDelay: 5000,
				}}
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
