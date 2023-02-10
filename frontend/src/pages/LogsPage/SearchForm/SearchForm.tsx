import { Box, Form, Stack } from '@highlight-run/ui'
import { RelativeTimePicker } from '@pages/LogsPage/SearchForm/DatePicker/RelativeTimePicker'
import React, { useState } from 'react'

type Props = {
	onFormSubmit: (query: string) => void
	onDatesSelected: (startDate: Date, endDate: Date) => void
	initialQuery: string
	initialStartDate: Date
	initialEndDate: Date
}

const SearchForm = ({
	initialQuery,
	initialStartDate,
	initialEndDate,
	onDatesSelected,
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
			<Stack direction="row" align="center">
				<Box flexGrow={1}>
					<Form.Input
						name="search"
						value={query}
						placeholder="Search your logs..."
						onChange={handleSearchChange}
					/>
				</Box>
				<RelativeTimePicker
					initialEndDate={initialEndDate}
					initialStartDate={initialStartDate}
					onDatesSelected={onDatesSelected}
				/>
			</Stack>
		</form>
	)
}

export { SearchForm }
