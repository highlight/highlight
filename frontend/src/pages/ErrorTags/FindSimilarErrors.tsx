import { Box, Form, Stack } from '@highlight-run/ui'
import { useState } from 'react'

import { useFindSimilarErrorsQuery } from '@/graph/generated/hooks'

export function FindSimilarErrors() {
	const [query, setQuery] = useState('')
	const { data, loading } = useFindSimilarErrorsQuery({
		variables: { query },
		skip: !query,
	})

	console.log({ queryValue: query, data, loading })

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		const formData = new FormData(e.target as HTMLFormElement)
		const query = (formData.get('query') as string) || ''

		setQuery(query)
	}

	return (
		<section>
			<h2>Find Similar Errors</h2>
			<form onSubmit={onSubmit}>
				<Stack gap="8">
					<Form.Input name="query" />
					<Box>
						<Form.Submit disabled={loading} type="submit">
							Search
						</Form.Submit>
					</Box>
				</Stack>
			</form>
		</section>
	)
}
