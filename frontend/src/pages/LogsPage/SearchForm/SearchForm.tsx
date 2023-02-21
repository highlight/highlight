import { useGetLogsKeysQuery } from '@graph/hooks'
import { GetLogsKeysQuery } from '@graph/operations'
import {
	Box,
	Combobox,
	Preset,
	PreviousDateRangePicker,
	useComboboxState,
} from '@highlight-run/ui'
import { queryStringToSearchParams } from '@pages/LogsPage/SearchForm/utils'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useRef, useState } from 'react'

import * as styles from './SearchForm.css'

type Props = {
	onFormSubmit: (query: string) => void
	initialQuery: string
	startDate: Date
	endDate: Date
	onDatesChange: (startDate: Date, endDate: Date) => void
	presets: Preset[]
	minDate: Date
}

const MAX_ITEMS = 10

const SearchForm = ({
	initialQuery = '',
	startDate,
	endDate,
	onDatesChange,
	onFormSubmit,
	presets,
	minDate,
}: Props) => {
	const [query, setQuery] = useState(initialQuery)
	const [selectedDates, setSelectedDates] = useState([startDate, endDate])
	const { project_id } = useParams()

	const { data: keysData } = useGetLogsKeysQuery({
		variables: {
			project_id: project_id!,
		},
	})

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		onFormSubmit(query)
	}

	const handleSearchChange = (key: GetLogsKeysQuery['logs_keys'][0]) => {
		setQuery(key.name)
	}

	const handleDatesChange = (dates: Date[]) => {
		setSelectedDates(dates)

		if (dates.length == 2) {
			onDatesChange(dates[0], dates[1])
		}
	}

	return (
		<form onSubmit={handleSubmit} style={{ position: 'relative' }}>
			<Box display="flex" gap="8" width="full">
				<Search
					keys={keysData?.logs_keys}
					query={query}
					handleSearchChange={handleSearchChange}
				/>
				<Box display="flex">
					<PreviousDateRangePicker
						selectedDates={selectedDates}
						onDatesChange={handleDatesChange}
						presets={presets}
						minDate={minDate}
					/>
				</Box>
			</Box>
		</form>
	)
}

export { SearchForm }

const Search: React.FC<{
	keys?: GetLogsKeysQuery['logs_keys']
	query: string
	handleSearchChange: any
}> = ({ keys, handleSearchChange, query }) => {
	const [queryText, setQueryText] = useState('')
	const [activeQuery, setActiveQuery] = useState('')
	const [searchType, setSearchType] = useState<'keys' | 'values'>('keys')
	const containerRef = useRef<HTMLDivElement | null>(null)
	const state = useComboboxState({ gutter: 4, sameWidth: true })
	// TODO: Handle active term not being at the end.
	const activeTerm = queryStringToSearchParams(queryText)[0]
	console.log('::: activeTerm', activeTerm)

	const visibleItems =
		keys?.filter(
			(key) => !activeQuery.length || key.name.indexOf(activeQuery) > -1,
		) || []
	visibleItems.length = MAX_ITEMS

	// TODO: Handle visible items being values instead of keys

	useEffect(() => {}, [queryText])

	useEffect(() => {
		setQueryText(query)
	}, [query])

	return (
		<Box
			display="flex"
			flexGrow={1}
			ref={containerRef}
			cssClass={styles.container}
		>
			<Combobox
				state={state}
				name="search"
				placeholder="Search your logs..."
				value={queryText}
				onChange={(e) => setQueryText(e.target.value)}
				className={styles.combobox}
				setValueOnChange={false}
			/>
			{keys?.length && (
				<Combobox.Popover
					className={styles.comboboxPopover}
					state={state}
					style={{ right: 0 }}
				>
					{visibleItems.map((key, index) => (
						<Combobox.Item
							className={styles.comboboxItem}
							key={index}
							onClick={() => {
								handleSearchChange(key)

								// TODO: Don't close if selecting key for query.
								state.setOpen(false)
							}}
						>
							{key.name} ({key.type})
						</Combobox.Item>
					))}
				</Combobox.Popover>
			)}
		</Box>
	)
}
