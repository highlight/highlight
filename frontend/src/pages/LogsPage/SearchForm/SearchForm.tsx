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
	LogsSearchParam,
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
					onSubmit={handleSubmit}
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
	onSubmit: any
}> = ({ keys, onSearchChange, onSubmit, query }) => {
	const { project_id } = useParams()
	const [queryText, setQueryText] = useState('')
	const containerRef = useRef<HTMLDivElement | null>(null)
	const inputRef = useRef<HTMLInputElement | null>(null)
	const state = useComboboxState({ gutter: 4, sameWidth: true })
	const [getLogsKeyValues, { data }] = useGetLogsKeyValuesLazyQuery()

	// TODO: Handle active term not being at the end.
	const queryTerms = parseLogsQuery(queryText)
	const cursorIndex = inputRef.current?.selectionStart || 0
	const activeTermIndex = getActiveTermIndex(cursorIndex, queryTerms)
	const activeTerm = queryTerms[activeTermIndex]
	const startingNewTerm = queryText.endsWith(' ')
	console.log('::: activeTerm', activeTerm, startingNewTerm)

	const showValues =
		activeTerm.key === 'text' ||
		!!keys?.find((k) => k.name === activeTerm.key)
	debugger

	const activeTermKeys = queryTerms.map((term) => term.key)
	keys = keys?.filter((key) => activeTermKeys.indexOf(key.name) === -1)

	const visibleItems = showValues
		? getVisibleValues(activeTerm, data?.logs_key_values)
		: getVisibleKeys(queryText, activeTerm, keys)
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

		if (visibleItems.length === 0) {
			debugger
			state.setOpen(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query])

	const handleKeyChange = (
		key: GetLogsKeysQuery['logs_keys'][0],
		termIndex: number,
	) => {
		queryTerms[termIndex].key = key.name
		queryTerms[termIndex].value = ''
		const query = stringifyLogsQuery(queryTerms)
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
					{queryText.length > 0 && (
						<Combobox.Item
							className={styles.comboboxItem}
							onClick={() => onSubmit()}
						>
							Run Query
						</Combobox.Item>
					)}
					{visibleItems.map((key, index) => (
						<Combobox.Item
							className={styles.comboboxItem}
							key={index}
							onClick={() => {
								if (typeof key === 'string') {
									// value replacement
									queryTerms[activeTermIndex].value = key
								} else {
									// key replacement
									queryTerms[activeTermIndex].key = key.name
									queryTerms[activeTermIndex].value = ''
								}

								const query = stringifyLogsQuery(queryTerms)
								onSearchChange(query)
								setQueryText(query)
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

const getActiveTermIndex = (
	cursorIndex: number,
	params: LogsSearchParam[],
): number => {
	let activeTermIndex

	params.find((param, index) => {
		if (param.offsetStart <= cursorIndex) {
			activeTermIndex = index
			return false
		}

		return true
	})

	return activeTermIndex === undefined ? params.length - 1 : activeTermIndex
}

const getVisibleKeys = (
	queryText: string,
	activeTerm: LogsSearchParam,
	keys?: GetLogsKeysQuery['logs_keys'],
) => {
	const startingNewTerm = queryText.endsWith(' ')

	return (
		keys?.filter(
			(key) =>
				startingNewTerm ||
				(activeTerm.key === 'text' &&
					(!activeTerm.value.length ||
						startingNewTerm ||
						key.name.indexOf(activeTerm.value) > -1)),
		) || []
	)
}

const getVisibleValues = (activeTerm: LogsSearchParam, values?: string[]) => {
	return (
		values?.filter(
			(v) => !activeTerm.value.length || v.indexOf(activeTerm.value) > -1,
		) || []
	)
}
