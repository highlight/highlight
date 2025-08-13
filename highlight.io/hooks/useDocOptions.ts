import { useEffect, useState } from 'react'

export interface DocLink {
	metadata: any
	simple_path: string
	array_path: string[]
	hasContent: boolean
}

export function useDocOptions(initialOptions?: DocLink[]) {
	const [docOptions, setDocOptions] = useState<DocLink[]>(
		initialOptions || [],
	)
	const [loading, setLoading] = useState(!initialOptions)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		// If we have initial options from SSR, don't fetch
		if (initialOptions && initialOptions.length > 0) {
			return
		}

		let cancelled = false

		const fetchDocOptions = async () => {
			try {
				const response = await fetch('/api/docs/options')
				if (!response.ok) {
					throw new Error('Failed to fetch doc options')
				}
				const data = await response.json()

				if (!cancelled) {
					setDocOptions(data)
					setLoading(false)
				}
			} catch (err) {
				if (!cancelled) {
					setError(err as Error)
					setLoading(false)
				}
			}
		}

		fetchDocOptions()

		return () => {
			cancelled = true
		}
	}, [initialOptions])

	return { docOptions, loading, error }
}
