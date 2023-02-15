import { Box, Form, Preset, PreviousDateRangePicker } from '@highlight-run/ui'
import React, { useState } from 'react'

type Props = {
	onFormSubmit: (query: string) => void
	initialQuery: string
	startDate: Date
	endDate: Date
	onDatesChange: (startDate: Date, endDate: Date) => void
	presets: Preset[]
}

const SearchForm = ({
	initialQuery,
	startDate,
	endDate,
	onDatesChange,
	onFormSubmit,
	presets,
}: Props) => {
	const [query, setQuery] = useState(initialQuery)
	const [selectedDates, setSelectedDates] = useState([startDate, endDate])
	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		onFormSubmit(query)
	}

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value)
	}

	const handleDatesChange = (dates: Date[]) => {
		setSelectedDates(dates)

		if (dates.length == 2) {
			onDatesChange(dates[0], dates[1])
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<Box display="flex" gap="8" width="full">
				<Box display="flex" flexGrow={1}>
					<Form.Input
						name="search"
						value={query}
						placeholder="Search your logs..."
						onChange={handleSearchChange}
					/>
				</Box>
				<Box display="flex">
					<PreviousDateRangePicker
						selectedDates={selectedDates}
						onDatesChange={handleDatesChange}
						presets={presets}
					/>
				</Box>
			</Box>
		</form>
	)
}

export { SearchForm }
