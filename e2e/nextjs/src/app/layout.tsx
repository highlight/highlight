// src/app/layout.tsx
import './globals.css'

import { CONSTANTS } from '@/constants'
import { ErrorBoundary, HighlightInit } from '@highlight-run/next/client'

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
		<ErrorBoundary>
			<HighlightInit
				debug={{ clientInteractions: true, domRecording: true }}
				projectId={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
				serviceName="my-nextjs-frontend"
				environment="e2e-test"
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true,
				}}
				consoleMethodsToRecord={['log', 'warn']}
				// inlineImages={false}
				enableCanvasRecording={true}
				samplingStrategy={{
					canvas: undefined,
					canvasManualSnapshot: 1,
					canvasMaxSnapshotDimension: 480,
					canvasFactor: 0.5,
					canvasClearWebGLBuffer: false,
				}}
				backendUrl={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL}
				otlpEndpoint={CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT}
			/>

			<html lang="en" data-layout>
				<body>
					<div>{children}</div>
				</body>
			</html>
		</ErrorBoundary>
	)
}
