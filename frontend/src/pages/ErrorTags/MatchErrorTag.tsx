import { Box, Form, Heading, Stack, Table } from '@highlight-run/ui'
import { useState } from 'react'

import { useMatchErrorTagQuery } from '@/graph/generated/hooks'

export function MatchErrorTag() {
	const [query, setQuery] = useState('')
	const { data, loading } = useMatchErrorTagQuery({
		variables: { query: query },
		skip: !query,
	})

	async function onMatchErrorTagSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		const formData = new FormData(e.target as HTMLFormElement)
		const query = (formData.get('query') as string) || ''

		setQuery(query)
	}

	return (
		<Stack gap="32">
			<Box>
				<Box paddingBottom="16">
					<Heading level="h4">Match Error Tag</Heading>
				</Box>
				<form onSubmit={onMatchErrorTagSubmit}>
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
							{data?.match_error_tag?.map((tag) =>
								tag ? (
									<Table.Row
										gridColumns={['5rem', '10rem', '1fr']}
										key={tag.id}
									>
										<Table.Cell>
											{Math.round(tag.score * 100) / 100}
										</Table.Cell>
										<Table.Cell>{tag.title}</Table.Cell>
										<Table.Cell>
											{tag.description}
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
