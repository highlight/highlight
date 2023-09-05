import { Box, Preset } from '@highlight-run/ui'
import React from 'react'

import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import { TIME_MODE } from '@/pages/LogsPage/constants'

import * as styles from './TracesSearch.css'

type Props = {
	// TODO: Use props interface from SearchForm
	startDate: Date
	endDate: Date
	onDatesChange: (startDate: Date, endDate: Date) => void
	onFormSubmit: (query: string) => void
}

export const TracesSearch: React.FC<Props> = ({
	startDate,
	endDate,
	onDatesChange,
	onFormSubmit,
}) => {
	const presets: Preset[] = []
	const minDate = new Date() // TODO: 30 days ago
	const timeMode: TIME_MODE = 'fixed-range'

	return (
		<Box cssClass={styles.container}>
			<SearchForm
				onFormSubmit={onFormSubmit}
				initialQuery=""
				startDate={startDate}
				endDate={endDate}
				onDatesChange={onDatesChange}
				presets={presets}
				minDate={minDate}
				timeMode={timeMode}
			/>
		</Box>
	)
}
