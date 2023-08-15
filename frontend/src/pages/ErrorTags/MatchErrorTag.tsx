import { Box, Form, Stack } from '@highlight-run/ui'
import { useState } from 'react'

import { useMatchErrorTagQuery } from '@/graph/generated/hooks'

export function MatchErrorTag() {
	const [matchValue, setMatchValue] = useState('')
	const { data: matchErrorTagData, loading } = useMatchErrorTagQuery({
		variables: { text: matchValue },
		skip: !matchValue,
	})

	console.log({ matchValue, matchErrorTagData, loading })

	async function onMatchErrorTagSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		const formData = new FormData(e.target as HTMLFormElement)
		const match = (formData.get('match') as string) || ''

		setMatchValue(match)
	}

	return (
		<section>
			<h2>Match Error Tag</h2>
			<form onSubmit={onMatchErrorTagSubmit}>
				<Stack gap="8">
					<Form.Input name="match" />
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
