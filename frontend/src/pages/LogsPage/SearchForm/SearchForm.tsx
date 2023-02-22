import { useGetLogsKeysQuery, useGetLogsKeyValuesLazyQuery } from '@graph/hooks'
import { GetLogsKeysQuery } from '@graph/operations'
import {
	Badge,
	Box,
	Combobox,
	IconSolidArrowsExpand,
	IconSolidSearch,
	Preset,
	PreviousDateRangePicker,
	Stack,
	Text,
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
			<Box
				alignItems="stretch"
				display="flex"
				gap="8"
				width="full"
				borderBottom="dividerWeak"
			>
				<Search
					keys={keysData?.logs_keys}
					query={query}
					onSearchChange={handleSearchChange}
				/>
				<Box display="flex" pr="8" py="6">
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
	const state = useComboboxState({ gutter: 6, sameWidth: true })
	const [getLogsKeyValues, { data }] = useGetLogsKeyValuesLazyQuery()

	const queryTerms = parseLogsQuery(queryText)
	const cursorIndex = inputRef.current?.selectionStart || 0
	const activeTermIndex = getActiveTermIndex(cursorIndex, queryTerms)
	const activeTerm = queryTerms[activeTermIndex]
	const startingNewTerm = queryText.endsWith(' ')
	console.log('::: activeTerm', activeTerm, queryTerms, startingNewTerm)

	const showValues =
		activeTerm.key !== 'text' ||
		!!keys?.find((k) => k.name === activeTerm.key)

	const activeTermKeys = queryTerms.map((term) => term.key)
	keys = keys?.filter((key) => activeTermKeys.indexOf(key.name) === -1)

	const visibleItems = showValues
		? getVisibleValues(activeTerm, data?.logs_key_values)
		: getVisibleKeys(queryText, activeTerm, keys)
	console.log('::: items', showValues, visibleItems)

	// Limit number of items shown
	visibleItems.length = Math.min(MAX_ITEMS, visibleItems.length)

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

	const handleItemSelect = (
		key: GetLogsKeysQuery['logs_keys'][0] | string,
	) => {
		let newQueryText

		// If string, it's a value not a key
		if (typeof key === 'string') {
			queryTerms[activeTermIndex].value = key
			// Add trailing space to start new query
			newQueryText = `${stringifyLogsQuery(queryTerms)} `
		} else {
			queryTerms[activeTermIndex].key = key.name
			queryTerms[activeTermIndex].value = ''
			newQueryText = stringifyLogsQuery(queryTerms)
		}

		setQueryText(newQueryText)
		// state.setActiveId(null)
	}

	const handleSearch = () => {
		if (query === queryText) {
			return
		}

		onSearchChange(queryText)
		state.setOpen(false)
	}

	return (
		<Box
			alignItems="stretch"
			display="flex"
			flexGrow={1}
			ref={containerRef}
			position="relative"
		>
			<IconSolidSearch className={styles.searchIcon} />

			<Combobox
				autoSelect
				ref={inputRef}
				state={state}
				name="search"
				placeholder="Search your logs..."
				value={queryText}
				onChange={(e) => {
					setQueryText(e.target.value)
					state.setOpen(true)
					state.setActiveId(state.items[0].id)
				}}
				className={styles.combobox}
				setValueOnChange={false}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && state.activeId === null) {
						handleSearch()
					}
				}}
				onBlur={handleSearch}
			/>

			{visibleItems.length > 0 && (
				<Combobox.Popover
					className={styles.comboboxPopover}
					state={state}
				>
					<Box py="4">
						<Combobox.Group
							className={styles.comboboxGroup}
							state={state}
						>
							<Combobox.GroupLabel state={state}>
								<Box px="10" py="6">
									<Text size="xSmall" color="weak">
										Filters
									</Text>
								</Box>
							</Combobox.GroupLabel>
							{visibleItems.map((key, index) => (
								<Combobox.Item
									className={styles.comboboxItem}
									key={index}
									onClick={() => handleItemSelect(key)}
									state={state}
								>
									{typeof key === 'string' ? (
										<Text>{key}</Text>
									) : (
										<Stack direction="row" gap="8">
											<Text>{key.name}:</Text>{' '}
											<Text color="weak">
												{key.type.toLowerCase()}
											</Text>
										</Stack>
									)}
								</Combobox.Item>
							))}
						</Combobox.Group>
					</Box>
					<Box
						bbr="8"
						py="4"
						px="6"
						backgroundColor="raised"
						borderTop="dividerWeak"
						display="flex"
						flexDirection="row"
						gap="20"
					>
						<Box
							display="inline-flex"
							flexDirection="row"
							alignItems="center"
							gap="6"
						>
							<Badge
								variant="gray"
								size="small"
								iconStart={<IconSolidArrowsExpand />}
							/>{' '}
							<Text color="weak" size="xSmall">
								Select
							</Text>
						</Box>
						<Box
							display="inline-flex"
							flexDirection="row"
							alignItems="center"
							gap="6"
						>
							<Badge variant="gray" size="small" label="Enter" />
							<Text color="weak" size="xSmall">
								Open
							</Text>
						</Box>
						<Box
							display="inline-flex"
							flexDirection="row"
							alignItems="center"
							gap="6"
						>
							<Badge variant="gray" size="small" label="Enter" />
							<Text color="weak" size="xSmall">
								Open
							</Text>
						</Box>
					</Box>
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
