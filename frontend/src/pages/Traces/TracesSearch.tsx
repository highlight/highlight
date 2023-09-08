import { Box, defaultPresets } from '@highlight-run/ui'
import React from 'react'

import { TIME_MODE } from '@/components/Search/SearchForm/constants'
import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import {
	useGetLogsKeysQuery,
	useGetLogsKeyValuesLazyQuery,
} from '@/graph/generated/hooks'

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
	const minDate = defaultPresets[5].startDate
	const timeMode: TIME_MODE = 'fixed-range'

	return (
		<Box cssClass={styles.container}>
			<SearchForm
				initialQuery=""
				startDate={startDate}
				endDate={endDate}
				presets={defaultPresets}
				minDate={minDate}
				timeMode={timeMode}
				onFormSubmit={onFormSubmit}
				onDatesChange={onDatesChange}
				fetchKeys={useGetLogsKeysQuery}
				fetchValuesLazyQuery={useGetLogsKeyValuesLazyQuery}
			/>
		</Box>
	)
}
