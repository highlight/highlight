'use client'

import { H } from 'highlight.run'
import { useEffect } from 'react'

export function Highlight({ projectId }: { projectId?: string }) {
	useEffect(() => {
		if (projectId) {
			console.log('Highlight init', projectId)

			H.init(projectId, {
				tracingOrigins: true,
				networkRecording: {
					enabled: true,
					recordHeadersAndBody: true,
					urlBlocklist: [
						// insert urls you don't want to record here
					],
				},
				backendUrl: 'https:/localhost:8082/public',
			})
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return null
}
