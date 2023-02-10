import { Box, Form, Stack, Text } from '@highlight-run/ui'
import React, { useState } from 'react'

type Props = {
	onFormSubmit: (query: string) => void
	initialQuery: string
	startDate: string
	endDate: string
}

const SearchForm = ({
	initialQuery,
	startDate,
	endDate,
	onFormSubmit,
}: Props) => {
	const [query, setQuery] = useState(initialQuery)
	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		onFormSubmit(query)
	}

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value)
	}

	return (
		<form onSubmit={handleSubmit}>
			<Stack direction="row">
				<Box width="full">
					<Form.Input
						name="search"
						value={query}
						placeholder="Search your logs..."
						onChange={handleSearchChange}
					/>
				</Box>
				<Box flexGrow={1}>
					<Text>
						{startDate} to {endDate}
					</Text>
				</Box>
			</Stack>
		</form>
	)
}

export { SearchForm }
