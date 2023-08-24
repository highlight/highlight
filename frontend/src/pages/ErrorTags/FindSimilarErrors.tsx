import { Box, Form, Heading, Stack, Table } from '@highlight-run/ui'
import { useState } from 'react'

import { useFindSimilarErrorsQuery } from '@/graph/generated/hooks'

export function FindSimilarErrors() {
	const [query, setQuery] = useState('')
	const { data, loading } = useFindSimilarErrorsQuery({
		variables: { query },
		skip: !query,
	})

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		const formData = new FormData(e.target as HTMLFormElement)
		const query = (formData.get('query') as string) || ''

		setQuery(query)
	}

	return (
		<Stack gap="32">
			<Box>
				<Box paddingBottom="16">
					<Heading level="h4">Find Similar Errors</Heading>
				</Box>
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
			</Box>
			{data ? (
				<Box>
					<Table>
						<Table.Head>
							<Table.Row gridColumns={['5rem', '10rem', '1fr']}>
								<Table.Header>Score</Table.Header>
								<Table.Header>Title</Table.Header>
								<Table.Header>Description</Table.Header>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{data?.find_similar_errors?.map((tag) =>
								tag ? (
									<Table.Row
										gridColumns={['5rem', '10rem', '1fr']}
										key={tag.id}
									>
										<Table.Cell wordBreak="break-all">
											{Math.round(tag.score * 100) / 100}
										</Table.Cell>
										<Table.Cell>
											{tag.event.join(', ')}
										</Table.Cell>
										<Table.Cell wordBreak="break-all">
											{tag.stack_trace}
										</Table.Cell>
									</Table.Row>
								) : null,
							)}
						</Table.Body>
					</Table>
				</Box>
			) : null}
		</Stack>
	)
}
