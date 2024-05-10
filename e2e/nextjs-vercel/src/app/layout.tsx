// src/app/layout.tsx
import './globals.css'

import { HighlightInit } from '@highlight-run/next/client'

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
		<html lang="en" data-layout>
			<head>
				<HighlightInit
					debug={{ clientInteractions: true, domRecording: true }}
					projectId={'1383'}
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
				/>
			</head>
			<body>
				<div>{children}</div>
			</body>
		</html>
	)
}

export const runtime = 'edge'
