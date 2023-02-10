import { Box, Form, Stack } from '@highlight-run/ui'
import { PRESETS } from '@pages/LogsPage/SearchForm/DatePicker/RelativeTimePicker/presets'
import { RelativeTimePicker } from '@pages/LogsPage/SearchForm/DatePicker/RelativeTimePicker/RelativeTimePicker'
import React, { useState } from 'react'

type Props = {
	onFormSubmit: (query: string) => void
	onDatesSelected: (startDate: Date, endDate: Date) => void
	initialQuery: string
	initialStartDate: Date | undefined
	initialEndDate: Date | undefined
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
					initialPreset={PRESETS.last_15_minutes}
					presets={[
						PRESETS.last_15_minutes,
						PRESETS.last_60_minutes,
						PRESETS.last_4_hours,
						PRESETS.last_24_hours,
						PRESETS.last_7_days,
						PRESETS.last_30_days,
					]}
					onDatesSelected={onDatesSelected}
				/>
			</Stack>
		</form>
	)
}

export { SearchForm }
