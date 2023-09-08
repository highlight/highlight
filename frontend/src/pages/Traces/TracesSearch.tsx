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
	query: string
	startDate: Date
	endDate: Date
	onDatesChange: (startDate: Date, endDate: Date) => void
	onFormSubmit: (query: string) => void
}

export const TracesSearch: React.FC<Props> = ({
	query,
	startDate,
	endDate,
	onDatesChange,
	onFormSubmit,
}) => {
	const minDate = defaultPresets[5].startDate
	const timeMode: TIME_MODE = 'fixed-range' // TODO: Support permalink mode

	return (
		<Box cssClass={styles.container}>
			<SearchForm
				initialQuery={query ?? ''}
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
