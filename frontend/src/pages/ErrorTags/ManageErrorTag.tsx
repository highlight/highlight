import { Box, Form, Heading, Stack, Table } from '@highlight-run/ui'
import { useState } from 'react'

import {
	useCreateErrorTagMutation,
	useGetErrorTagsQuery,
} from '@/graph/generated/hooks'

export function ManageErrorTags() {
	const { data: errorTags } = useGetErrorTagsQuery()
	const [createErrorTag, { loading }] = useCreateErrorTagMutation()
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')

	async function onCreateErrorTagSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		if (!title || !description) {
			throw new Error('Title and description are required')
		}

		await createErrorTag({
			variables: { title, description },
			refetchQueries: ['GetErrorTags'],
		})

		setTitle('')
		setDescription('')
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

				<form onSubmit={onCreateErrorTagSubmit}>
					<Stack gap="8">
						<Form.Field
							label="Title"
							type="text"
							name="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
						<Form.Field
							label="Description"
							type="text"
							name="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
						<Box>
							<Form.Submit type="submit" disabled={loading}>
								Add Tag
							</Form.Submit>
						</Box>
					</Stack>
				</form>
			</Box>
		</Stack>
	)
}
