import { Button } from '@components/Button'
import { Box, Form, Heading, Stack, Table } from '@highlight-run/ui/components'

import {
	useCreateErrorTagMutation,
	useGetErrorTagsQuery,
	useUpdateErrorTagsMutation,
} from '@/graph/generated/hooks'

export function ManageErrorTags() {
	const { data: errorTags } = useGetErrorTagsQuery()
	const [createErrorTag, { loading }] = useCreateErrorTagMutation()
	const [updateErrorTags, { loading: updateErrorTagsLoading }] =
		useUpdateErrorTagsMutation()

	const store = Form.useStore({
		defaultValues: {
			title: '',
			description: '',
		},
	})

	async function onCreateErrorTagSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const title = store.getValue(store.names.title)
		const description = store.getValue(store.names.description)
		if (!title || !description) {
			throw new Error('Title and description are required')
		}

		await createErrorTag({
			variables: { title, description },
			refetchQueries: ['GetErrorTags'],
		})

		store.reset()
	}

	return (
		<Stack gap="32">
			<Box>
				<Box paddingBottom="16">
					<Heading level="h4" marginBottom="16">
						Error Tags
					</Heading>
				</Box>

				<Table>
					<Table.Head>
						<Table.Row gridColumns={['10rem', '1fr']}>
							<Table.Header>Title</Table.Header>
							<Table.Header>Description</Table.Header>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{errorTags?.error_tags?.map((tag) =>
							tag ? (
								<Table.Row
									gridColumns={['10rem', '1fr']}
									key={tag.id}
								>
									<Table.Cell>{tag.title}</Table.Cell>
									<Table.Cell>{tag.description}</Table.Cell>
								</Table.Row>
							) : null,
						)}
					</Table.Body>
				</Table>
			</Box>

			<Box>
				<Box paddingBottom="16">
					<Heading level="h4">Create Error Tag</Heading>
				</Box>

				<Form store={store} onSubmit={onCreateErrorTagSubmit}>
					<Stack gap="8">
						<Form.Input
							label="Title"
							type="text"
							name={store.names.title}
						/>
						<Form.Input
							label="Description"
							type="text"
							name={store.names.description}
						/>
						<Box>
							<Form.Submit type="submit" disabled={loading}>
								Add Tag
							</Form.Submit>
						</Box>
						<Box py="16">
							<Button
								trackingId="error-tag-admin-update-embeddings"
								type="button"
								loading={updateErrorTagsLoading}
								onClick={async () => {
									await updateErrorTags()
								}}
							>
								Update Embeddings
							</Button>
						</Box>
					</Stack>
				</Form>
			</Box>
		</Stack>
	)
}
