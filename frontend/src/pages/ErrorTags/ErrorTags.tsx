import {
	Badge,
	Box,
	Form,
	IconSolidCheveronRight,
	IconSolidLightningBolt,
	Stack,
	Table,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'

import styles from './ErrorTags.module.css'

const DEFAULT_QUERIES = [
	'error creating session, user agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36: ERROR: duplicate key value violates unique constraint "idx_sessions_secure_id" (SQLSTATE 23505) ERROR: duplicate key value ERROR: duplicate key value violates unique constraint "idx_sessions_secure_id" (SQLSTATE 23505)',
	`Uncaught ServerError: Response not successful: Received status code 500`,
	`Firebase: A network AuthError (such as timeout, interrupted connection or unreachable host) has occurred. (auth/network-request-failed).`,
	'strconv.Atoi: parsing "w": invalid syntax\nstrconv.Atoi: parsing "w": invalid syntax',
]

export function ErrorTags() {
	const formStore = Form.useStore({
		defaultValues: {
			query: '',
		},
	})
	const inputValue = formStore.useValue('query')
	const navigate = useNavigate()
	function navigateToSearch(q: string) {
		const encodedQuery = btoa(q)
		navigate(`/error-tags/search?q=${encodedQuery}`)
	}
	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		if (inputValue) {
			navigateToSearch(inputValue)
		}
	}

	return (
		<Stack py="32" gap="12" cssClass={styles.narrowWrapper}>
			<Box
				style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
			>
				<Badge
					iconStart={<IconSolidLightningBolt />}
					variant="purple"
					size="medium"
					// className={styles.headerIcon}
				/>
				<Text cssClass={styles.headerText}>
					Highlight.io Error Embeddings
				</Text>
			</Box>
			<Form store={formStore} onSubmit={onSubmit}>
				<Stack gap="8">
					<Form.Input
						name={formStore.names.query}
						placeholder="Input error text"
					/>
					<Box
						style={{
							display: 'flex',
							justifyContent: 'right',
							gap: '0.5rem',
						}}
					>
						{/* <Tooltip
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
						</Tooltip> */}
						<Form.Submit
							type="submit"
							iconRight={<IconSolidCheveronRight />}
							disabled={!inputValue}
						>
							Categorize error
						</Form.Submit>
					</Box>
				</Stack>
			</Form>

			<Box>
				<Text cssClass={styles.subtitle}>Error examples</Text>

				<Table className={styles.table}>
					<Table.Body>
						{DEFAULT_QUERIES.map((query, i) => (
							<Table.Row
								key={`query-${i}`}
								gridColumns={['3rem', '1fr', '10rem']}
							>
								<Table.Cell>
									<Badge
										iconEnd={<IconSolidLightningBolt />}
										size="large"
										variant="gray"
									/>
								</Table.Cell>
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
										onClick={() => navigateToSearch(query)}
										kind="secondary"
									>
										Show categorization
									</Button>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table>
			</Box>
		</Stack>
	)
}
