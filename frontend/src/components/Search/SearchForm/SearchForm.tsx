import {
	GetLogsKeysQuery,
	GetLogsKeysQueryVariables,
	GetLogsKeyValuesQueryVariables,
	GetTracesKeysQuery,
	GetTracesKeysQueryVariables,
	GetTracesKeyValuesQueryVariables,
} from '@graph/operations'
import {
	Badge,
	Box,
	Combobox,
	defaultPresets,
	getNow,
	IconSolidPlus,
	IconSolidSearch,
	IconSolidSwitchVertical,
	IconSolidXCircle,
	Preset,
	PreviousDateRangePicker,
	Stack,
	Text,
	useComboboxStore,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import { stringify } from 'query-string'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	DateTimeParam,
	encodeQueryParams,
	StringParam,
	withDefault,
} from 'use-query-params'

import { Button } from '@/components/Button'
import {
	TIME_FORMAT,
	TIME_MODE,
} from '@/components/Search/SearchForm/constants'
import {
	BODY_KEY,
	DEFAULT_OPERATOR,
	parseSearchQuery,
	queryAsStringParams,
	quoteQueryValue,
	SearchParam,
	stringifySearchQuery,
} from '@/components/Search/SearchForm/utils'

import * as styles from './SearchForm.css'

export const QueryParam = withDefault(StringParam, '')
export const FixedRangeStartDateParam = withDefault(
	DateTimeParam,
	defaultPresets[0].startDate,
)
export const PermalinkStartDateParam = withDefault(
	DateTimeParam,
	defaultPresets[5].startDate,
)
export const EndDateParam = withDefault(DateTimeParam, getNow().toDate())

type FetchKeys = ({}: {
	variables: GetLogsKeysQueryVariables | GetTracesKeysQueryVariables
}) => { data?: { keys: Keys }; loading: boolean }
type FetchValues = () => [
	({}: {
		variables:
			| GetLogsKeyValuesQueryVariables
			| GetTracesKeyValuesQueryVariables
	}) => void,
	{ data?: { key_values: string[] }; loading: boolean },
]
type Keys = GetLogsKeysQuery['keys'] | GetTracesKeysQuery['keys']

const MAX_ITEMS = 10

export type SearchFormProps = {
	onFormSubmit: (query: string) => void
	initialQuery: string
	startDate: Date
	endDate: Date
	onDatesChange: (startDate: Date, endDate: Date) => void
	presets: Preset[]
	minDate: Date
	timeMode: TIME_MODE
	fetchKeys: FetchKeys
	fetchValuesLazyQuery: FetchValues
	disableSearch?: boolean
	actions?: React.FC<{
		query: string
		startDate: Date
		endDate: Date
	}>
	hideDatePicker?: boolean
	hideCreateAlert?: boolean
}

const SearchForm: React.FC<SearchFormProps> = ({
	initialQuery,
	startDate,
	endDate,
	fetchKeys,
	fetchValuesLazyQuery,
	onDatesChange,
	onFormSubmit,
	presets,
	minDate,
	timeMode,
	disableSearch,
	actions,
	hideDatePicker,
	hideCreateAlert,
}) => {
	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const [query, setQuery] = React.useState(initialQuery)

	const { data: keysData, loading: keysLoading } = fetchKeys({
		variables: {
			project_id: projectId,
			date_range: {
				start_date: moment(startDate).format(TIME_FORMAT),
				end_date: moment(endDate).format(TIME_FORMAT),
			},
		},
	})

	const [dateRange, setDateRange] = useState<Date[]>([startDate, endDate])

	const handleDatesChange = (dates: Date[]) => {
		setDateRange(dates)
		if (dates.length == 2) {
			onDatesChange(dates[0], dates[1])
		}
	}

	return (
		<>
			<Box
				alignItems="stretch"
				display="flex"
				gap="8"
				width="full"
				borderBottom="dividerWeak"
			>
				<Search
					initialQuery={initialQuery}
					startDate={startDate}
					endDate={endDate}
					keys={keysData?.keys}
					keysLoading={keysLoading}
					disableSearch={disableSearch}
					query={query}
					fetchValuesLazyQuery={fetchValuesLazyQuery}
					setQuery={setQuery}
					onFormSubmit={onFormSubmit}
				/>
				<Box display="flex" pr="8" py="6" gap="6">
					{actions && actions({ query, startDate, endDate })}
					{!hideDatePicker && (
						<PreviousDateRangePicker
							emphasis="low"
							selectedDates={dateRange}
							onDatesChange={handleDatesChange}
							presets={presets}
							minDate={minDate}
							disabled={timeMode === 'permalink'}
						/>
					)}
					{!hideCreateAlert && (
						<Button
							kind="secondary"
							trackingId="create-alert"
							onClick={() => {
								const encodedQuery = encodeQueryParams(
									{
										query: StringParam,
										start_date: DateTimeParam,
										end_date: DateTimeParam,
									},
									{
										query: query,
										start_date: startDate,
										end_date: endDate,
									},
								)

								navigate({
									// TODO: Handle traces
									pathname: `/${projectId}/alerts/logs/new`,
									search: stringify(encodedQuery),
								})
							}}
							emphasis="medium"
							iconLeft={<IconSolidPlus />}
						>
							Create alert
						</Button>
					)}
				</Box>
			</Box>
		</>
	)
}

export { SearchForm }

export const Search: React.FC<{
	initialQuery: string
	startDate: Date
	endDate: Date
	keys?: Keys
	hideIcon?: boolean
	keysLoading: boolean
	disableSearch?: boolean
	placeholder?: string
	query: string
	fetchValuesLazyQuery: FetchValues
	setQuery: (value: string) => void
	onFormSubmit: (query: string) => void
}> = ({
	initialQuery,
	startDate,
	endDate,
	hideIcon,
	keys,
	keysLoading,
	disableSearch,
	placeholder,
	query,
	fetchValuesLazyQuery,
	setQuery,
	onFormSubmit,
}) => {
	const { project_id } = useParams()
	const containerRef = useRef<HTMLDivElement | null>(null)
	const inputRef = useRef<HTMLInputElement | null>(null)
	const comboboxStore = useComboboxStore({
		defaultValue: query ?? '',
	})
	const [getKeyValues, { data, loading: valuesLoading }] =
		fetchValuesLazyQuery()

	const queryTerms = parseSearchQuery(query)
	const queryAsStringParts = queryAsStringParams(query)
	const cursorIndex = inputRef.current?.selectionStart || 0
	const activeTermIndex = getActiveTermIndex(cursorIndex, queryTerms)
	const activeTerm = queryTerms[activeTermIndex]

	const showValues =
		activeTerm.key !== BODY_KEY ||
		!!keys?.find((k) => k.name === activeTerm.key)
	const loading = showValues ? valuesLoading : keysLoading
	const showTermSelect = !!activeTerm.value.length

	const values = data?.key_values

	const visibleItems = showValues
		? getVisibleValues(activeTerm, values)
		: getVisibleKeys(query, queryTerms, activeTerm, keys)

	// Limit number of items shown
	visibleItems.length = Math.min(MAX_ITEMS, visibleItems.length)

	const showResults = loading || visibleItems.length > 0 || showTermSelect
	const isDirty = query !== ''

	const submitQuery = (query: string) => {
		onFormSubmit(query)
	}

	useEffect(() => {
		if (!showValues) {
			return
		}

		getKeyValues({
			variables: {
				project_id: project_id!,
				key_name: activeTerm.key,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
			},
		})
	}, [
		activeTerm.key,
		endDate,
		getKeyValues,
		project_id,
		showValues,
		startDate,
	])

	useEffect(() => {
		// necessary to update the combobox with the URL state
		setQuery(initialQuery.trim() === '' ? '' : initialQuery)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialQuery])

	useEffect(() => {
		if (query === '') {
			setTimeout(() => {
				comboboxStore.setActiveId(null)
				comboboxStore.setState('moves', 0)
			}, 0)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query])

	// TODO: Fix squashing body when selecting key. To repro, type "asdf " and
	// note how the dropdown opens. If you select a key from the list it
	// ends up removing the body term.
	const handleItemSelect = (key: Keys[0] | string, noQuotes?: boolean) => {
		const isValueSelect = typeof key === 'string'
		const activeTermKey = queryTerms[activeTermIndex].key
		const isLastTerm = activeTermIndex === queryTerms.length - 1

		// If string, it's a value not a key
		if (isValueSelect) {
			queryTerms[activeTermIndex].value = !!noQuotes
				? key
				: quoteQueryValue(key)
		} else {
			if (activeTermKey === BODY_KEY && activeTerm.value.endsWith(' ')) {
				queryTerms[activeTermIndex].value =
					queryTerms[activeTermIndex].value.trim()

				queryTerms.push({
					key: key.name,
					value: '',
					operator: DEFAULT_OPERATOR,
					offsetStart: query.length,
				})
			} else {
				queryTerms[activeTermIndex].key = key.name
				queryTerms[activeTermIndex].value = ''
			}
		}

		let newQuery = stringifySearchQuery(queryTerms)
		// Add space if it's the last term and a value is selected so people can
		// start entering the next term.
		isLastTerm && isValueSelect ? (newQuery += ' ') : null

		setQuery(newQuery)

		if (isValueSelect) {
			submitQuery(newQuery)
			comboboxStore.setOpen(false)
		}

		comboboxStore.setActiveId(null)
		comboboxStore.setState('moves', 0)
	}

	const handleRemoveItem = (index: number) => {
		const parts = [...queryAsStringParts]
		parts.splice(index, 1)
		const newQuery = parts.join(' ')
		setQuery(newQuery)
		submitQuery(newQuery)
	}

	return (
		<Box
			alignItems="stretch"
			display="flex"
			flexGrow={1}
			ref={containerRef}
			position="relative"
		>
			{!hideIcon ? (
				<IconSolidSearch className={styles.searchIcon} />
			) : null}

			<Box
				display="flex"
				alignItems="center"
				gap="6"
				width="full"
				color="weak"
				position="relative"
			>
				<Box
					cssClass={styles.comboboxTagsContainer}
					style={{
						left: hideIcon ? 6 : 2,
						paddingLeft: hideIcon ? undefined : 38,
					}}
				>
					{queryAsStringParts.map((term, index) => {
						if (!term.length) {
							return null
						}

						return (
							<TermTag
								key={index}
								term={term}
								index={index}
								onRemoveItem={handleRemoveItem}
							/>
						)
					})}
				</Box>
				<Combobox
					ref={inputRef}
					disabled={disableSearch}
					autoSelect
					store={comboboxStore}
					name="search"
					placeholder={placeholder ?? 'Search...'}
					className={styles.combobox}
					value={query}
					onChange={(e) => {
						// Need to set this bit of React state to force a re-render of the
						// component. For some reason the combobox value isn't updated until
						// after a delay or blurring the input.
						setQuery(e.target.value)
					}}
					onBlur={() => {
						submitQuery(query)
						inputRef.current?.blur()
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && query === '') {
							e.preventDefault()
							submitQuery(query)
							comboboxStore.setOpen(false)
						}
					}}
					style={{
						paddingLeft: hideIcon ? undefined : 40,
					}}
				/>

				{isDirty && !disableSearch && (
					<IconSolidXCircle
						size={16}
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()

							setQuery('')
							submitQuery('')
						}}
						style={{ cursor: 'pointer' }}
					/>
				)}
			</Box>

			{showResults && (
				<Combobox.Popover
					className={styles.comboboxPopover}
					style={{
						left: hideIcon ? undefined : 6,
					}}
					store={comboboxStore}
					gutter={10}
					sameWidth
				>
					<Box pt="4">
						<Combobox.GroupLabel store={comboboxStore}>
							{activeTerm.value && (
								<Combobox.Item
									className={styles.comboboxItem}
									onClick={() =>
										handleItemSelect(activeTerm.value, true)
									}
									store={comboboxStore}
								>
									<Stack direction="row" gap="8">
										<Text lines="1">
											{activeTerm.value}:
										</Text>{' '}
										<Text color="weak">
											{activeTerm.key ?? 'Body'}
										</Text>
									</Stack>
								</Combobox.Item>
							)}
							<Box px="10" py="6">
								<Text size="xSmall" color="weak">
									Filters
								</Text>
							</Box>
						</Combobox.GroupLabel>
					</Box>
					<Combobox.Group
						className={styles.comboboxGroup}
						store={comboboxStore}
					>
						{loading && (
							<Combobox.Item
								className={styles.comboboxItem}
								disabled
							>
								<Text>Loading...</Text>
							</Combobox.Item>
						)}
						{visibleItems.map((key, index) => (
							<Combobox.Item
								className={styles.comboboxItem}
								key={index}
								onClick={() => handleItemSelect(key)}
								store={comboboxStore}
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
					<Box
						bbr="8"
						py="4"
						px="6"
						backgroundColor="raised"
						borderTop="dividerWeak"
						justifyContent="space-between"
						display="flex"
						flexDirection="row"
					>
						<Box display="flex" flexDirection="row" gap="20">
							<Box
								display="inline-flex"
								flexDirection="row"
								alignItems="center"
								gap="6"
							>
								<Badge
									variant="gray"
									size="small"
									iconStart={<IconSolidSwitchVertical />}
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
								<Badge
									variant="gray"
									size="small"
									label="Enter"
								/>
								<Text color="weak" size="xSmall">
									Select
								</Text>
							</Box>
						</Box>
						<Box
							display="inline-flex"
							flexDirection="row"
							alignItems="center"
							gap="6"
						>
							<Badge variant="gray" size="small" label="*" />
							<Text color="weak" size="xSmall">
								Wildcard
							</Text>
						</Box>
					</Box>
				</Combobox.Popover>
			)}
		</Box>
	)
}

const TermTag: React.FC<{
	index: number
	term: string
	onRemoveItem: (index: number) => void
}> = ({ index, term, onRemoveItem }) => {
	return (
		<>
			<Box
				cssClass={styles.comboboxTag}
				py="6"
				position="relative"
				whiteSpace="nowrap"
			>
				<Box
					cssClass={styles.comboboxTagBackground}
					shadow="innerSecondary"
				/>
				<IconSolidXCircle
					className={styles.comboboxTagClose}
					size={13}
					onClick={() => onRemoveItem(index)}
				/>
				<Box>{term}</Box>
			</Box>
			&nbsp;
		</>
	)
}

const getActiveTermIndex = (
	cursorIndex: number,
	params: SearchParam[],
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
	queryTerms: SearchParam[],
	activeQueryTerm: SearchParam,
	keys?: Keys,
) => {
	const startingNewTerm = queryText.endsWith(' ')
	const activeTermKeys = queryTerms.map((term) => term.key)
	keys = keys?.filter((key) => activeTermKeys.indexOf(key.name) === -1)

	return (
		keys?.filter(
			(key) =>
				// If it's a new term, don't filter results.
				startingNewTerm ||
				// Only filter for body queries
				(activeQueryTerm.key === BODY_KEY &&
					// Don't filter if no query term
					(!activeQueryTerm.value.length ||
						startingNewTerm ||
						// Filter empty results
						(key.name.length > 0 &&
							// Only show results that contain the term
							key.name.indexOf(activeQueryTerm.value) > -1))),
		) || []
	)
}

const getVisibleValues = (activeQueryTerm: SearchParam, values?: string[]) => {
	return (
		values?.filter(
			(v) =>
				// Don't filter if no value has been typed
				!activeQueryTerm.value.length ||
				// Exclude the current term since that is given special treatment
				(v !== activeQueryTerm.value &&
					// Return values that match the query term
					v.indexOf(activeQueryTerm.value) > -1),
		) || []
	)
}
