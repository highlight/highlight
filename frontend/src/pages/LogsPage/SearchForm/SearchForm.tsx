import { useGetLogsKeysQuery, useGetLogsKeyValuesLazyQuery } from '@graph/hooks'
import { GetLogsKeysQuery } from '@graph/operations'
import {
	Box,
	Combobox,
	Preset,
	PreviousDateRangePicker,
	useComboboxState,
} from '@highlight-run/ui'
import {
	parseLogsQuery,
	stringifyLogsQuery,
} from '@pages/LogsPage/SearchForm/utils'
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

	const handleSearchChange = (search: string) => {
		setQuery(search)
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
					onSearchChange={handleSearchChange}
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
	onSearchChange: any
}> = ({ keys, onSearchChange, query }) => {
	const { project_id } = useParams()
	const [queryText, setQueryText] = useState('')
	const containerRef = useRef<HTMLDivElement | null>(null)
	const inputRef = useRef<HTMLInputElement | null>(null)
	const state = useComboboxState({ gutter: 4, sameWidth: true })
	const [getLogsKeyValues, { data }] = useGetLogsKeyValuesLazyQuery()

	console.log('::: inputRef', inputRef)
	if (inputRef.current) {
		debugger
	}

	// TODO: Handle active term not being at the end.
	const queryTerms = parseLogsQuery(queryText)
	const activeTerm = queryTerms.at(-1)!
	const startingNewTerm = queryText.endsWith(' ')
	const activeTermKeys = queryTerms.map((term) => term.key)

	const visibleKeys =
		keys?.filter(
			(key) =>
				(activeTermKeys.indexOf(key.name) === -1 && startingNewTerm) ||
				(activeTerm.key === 'text' &&
					(!activeTerm.value.length ||
						startingNewTerm ||
						(activeTermKeys.indexOf(key.name) === -1 &&
							key.name.indexOf(activeTerm.value) > -1))),
		) || []

	const visibleValues =
		data?.logs_key_values.filter(
			(v) => !activeTerm.value.length || v.indexOf(activeTerm.value) > -1,
		) || []

	const showValues =
		!startingNewTerm && !!keys?.find((k) => k.name === activeTerm.key)
	const visibleItems = showValues ? visibleValues : visibleKeys
	console.log('::: items', showValues, visibleItems)

	// Limit number of items shown
	visibleItems.length = MAX_ITEMS

	useEffect(() => {
		if (!showValues) {
			return
		}

		getLogsKeyValues({
			variables: {
				project_id: project_id!,
				key_name: activeTerm.key,
			},
		})
	}, [
		activeTerm.key,
		activeTerm.value,
		getLogsKeyValues,
		project_id,
		queryText,
		showValues,
	])

	// TODO: Probably not needed. Consider refactoring to store query text in form
	// state.
	useEffect(() => {
		if (query && query !== queryText) {
			setQueryText(query)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query])

	const handleKeyChange = (key: GetLogsKeysQuery['logs_keys'][0]) => {
		queryTerms.at(-1)!.key = key.name
		queryTerms.at(-1)!.value = ''
		const query = stringifyLogsQuery(queryTerms)
		onSearchChange(query)
		setQueryText(query)
	}

	const handleValueChange = (value: string) => {
		queryTerms.at(-1)!.value = value
		const query = `${stringifyLogsQuery(queryTerms)} `
		onSearchChange(query)
		setQueryText(query)
	}

	return (
		<Box
			display="flex"
			flexGrow={1}
			ref={containerRef}
			cssClass={styles.container}
		>
			<Combobox
				ref={inputRef}
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
								if (typeof key === 'string') {
									handleValueChange(key)
								} else {
									handleKeyChange(key)
								}
							}}
						>
							{typeof key === 'string'
								? key
								: `${key.name} (${key.type})`}
						</Combobox.Item>
					))}
				</Combobox.Popover>
			)}
		</Box>
	)
}
