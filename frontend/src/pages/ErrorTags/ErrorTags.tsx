import {
	Box,
	Form,
	Heading,
	IconSolidQuestionMarkCircle,
	Stack,
	Table,
	Tooltip,
} from '@highlight-run/ui'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'
import { setErrorTagsQuery } from '@/pages/ErrorTags/store-query'

const DEFAULT_QUERIES = [
	'error creating session, user agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36: ERROR: duplicate key value violates unique constraint "idx_sessions_secure_id" (SQLSTATE 23505) ERROR: duplicate key value ERROR: duplicate key value violates unique constraint "idx_sessions_secure_id" (SQLSTATE 23505)',
	`Uncaught ServerError: Response not successful: Received status code 500`,
	`Firebase: A network AuthError (such as timeout, interrupted connection or unreachable host) has occurred. (auth/network-request-failed).`,
]

export function ErrorTags() {
	const [inputValue, setInputValue] = useState('')
	const navigate = useNavigate()
	function setAndNavigate(q: string) {
		setErrorTagsQuery(q)
		navigate('/error-tags/search')
	}
	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		if (inputValue) {
			setAndNavigate(inputValue)
		}
	}

	return (
		<Stack py="32" gap="32">
			<Heading>Find related errors</Heading>
			<form onSubmit={onSubmit}>
				<Stack gap="8">
					<Form.Input
						name="query"
						placeholder="Input error text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
					/>
					<Box
						style={{
							display: 'flex',
							justifyContent: 'center',
							gap: '0.5rem',
						}}
					>
						<Tooltip
							trigger={
								<Box
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '0.25rem',
										fontSize: 13,
										fontWeight: 500,
									}}
								>
									Info <IconSolidQuestionMarkCircle />
								</Box>
							}
						>
							Test semantic search against errors logged on this
							application, app.highlight.io.
						</Tooltip>
						<Form.Submit type="submit">Search</Form.Submit>
					</Box>
				</Stack>
			</form>

			<Table>
				<Table.Head>
					<Table.Row gridColumns={['1fr', '7rem']}>
						<Table.Cell>Query</Table.Cell>
						<Table.Cell justifyContent="center">Action</Table.Cell>
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{DEFAULT_QUERIES.map((query, i) => (
						<Table.Row
							key={`query-${i}`}
							gridColumns={['1fr', '7rem']}
						>
							<Table.Cell
								style={{
									display: 'block',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
								}}
							>
								<Tooltip
									trigger={
										<Box
											style={{
												overflow: 'hidden',
												textOverflow: 'ellipsis',
											}}
										>
											{query}
										</Box>
									}
								>
									{query}
								</Tooltip>
							</Table.Cell>
							<Table.Cell justifyContent="center">
								<Button
									trackingId="error-tags-test-default-query-1"
									onClick={() => setAndNavigate(query)}
								>
									Test Query
								</Button>
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</Stack>
	)
}
