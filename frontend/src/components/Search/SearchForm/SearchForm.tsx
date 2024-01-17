import { useSavedSegments } from '@components/Search/useSavedSegments'
import { GetLogsKeysQuery, GetTracesKeysQuery } from '@graph/operations'
import {
	Badge,
	Box,
	Combobox,
	DateRangePicker,
	DateRangePreset,
	DateRangeValue,
	DEFAULT_TIME_PRESETS,
	IconSolidExternalLink,
	IconSolidPlus,
	IconSolidSearch,
	IconSolidSwitchVertical,
	IconSolidXCircle,
	Stack,
	Text,
	useComboboxStore,
} from '@highlight-run/ui/components'
import { useDebouncedValue } from '@hooks/useDebouncedValue'
import { useProjectId } from '@hooks/useProjectId'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
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
import { LinkButton } from '@/components/LinkButton'
import SearchGrammarParser from '@/components/Search/Parser/SearchGrammarParser'
import {
	TIME_FORMAT,
	TIME_MODE,
} from '@/components/Search/SearchForm/constants'
import {
	BODY_KEY,
	DEFAULT_OPERATOR,
	parseSearchQuery,
	quoteQueryValue,
	SearchParam,
	stringifySearchQuery,
} from '@/components/Search/SearchForm/utils'
import { parseSearch, SearchToken } from '@/components/Search/utils'
import {
	useGetLogsKeysLazyQuery,
	useGetLogsKeyValuesLazyQuery,
	useGetTracesKeysLazyQuery,
	useGetTracesKeyValuesLazyQuery,
} from '@/graph/generated/hooks'

import * as styles from './SearchForm.css'

export const QueryParam = withDefault(StringParam, '')
export const FixedRangePreset = DEFAULT_TIME_PRESETS[0]
export const PermalinkPreset = DEFAULT_TIME_PRESETS[5]

type FetchKeys =
	| typeof useGetLogsKeysLazyQuery
	| typeof useGetTracesKeysLazyQuery
type FetchValues =
	| typeof useGetLogsKeyValuesLazyQuery
	| typeof useGetTracesKeyValuesLazyQuery

type Keys = GetLogsKeysQuery['keys'] | GetTracesKeysQuery['keys']

const MAX_ITEMS = 10

export type SearchFormProps = {
	onFormSubmit: (query: string) => void
	initialQuery: string
	startDate: Date
	endDate: Date
	datePickerValue: DateRangeValue
	onDatesChange: (
		startDate?: Date,
		endDate?: Date,
		preset?: DateRangePreset,
	) => void
	presets: DateRangePreset[]
	minDate: Date
	timeMode: TIME_MODE
	fetchKeysLazyQuery: FetchKeys
	fetchValuesLazyQuery: FetchValues
	disableSearch?: boolean
	actions?: React.FC<{
		query: string
		startDate: Date
		endDate: Date
	}>
	hideDatePicker?: boolean
	hideCreateAlert?: boolean
	savedSegmentType?: 'Trace' | 'Log'
}

const SearchForm: React.FC<SearchFormProps> = ({
	initialQuery,
	startDate,
	endDate,
	datePickerValue,
	fetchKeysLazyQuery,
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
	savedSegmentType,
}) => {
	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const [query, setQuery] = React.useState(initialQuery)

	const handleQueryChange = (query?: string) => {
		const updatedQuery = query ?? ''
		setQuery(updatedQuery)
		onFormSubmit(updatedQuery)
	}

	const { SegmentMenu, SegmentModals } = useSavedSegments({
		query,
		setQuery: handleQueryChange,
		entityType: savedSegmentType,
		projectId,
	})

	return (
		<>
			{SegmentModals}
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
					disableSearch={disableSearch}
					query={query}
					fetchValuesLazyQuery={fetchValuesLazyQuery}
					fetchKeysLazyQuery={fetchKeysLazyQuery}
					setQuery={setQuery}
					onFormSubmit={onFormSubmit}
				/>
				<Box display="flex" pr="8" py="6" gap="6">
					{actions && actions({ query, startDate, endDate })}
					{!hideDatePicker && (
						<DateRangePicker
							emphasis="low"
							selectedValue={datePickerValue}
							onDatesChange={onDatesChange}
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
					{SegmentMenu}
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
	hideIcon?: boolean
	disableSearch?: boolean
	placeholder?: string
	query: string
	fetchKeysLazyQuery: FetchKeys
	fetchValuesLazyQuery: FetchValues
	setQuery: (value: string) => void
	onFormSubmit: (query: string) => void
}> = ({
	initialQuery,
	startDate,
	endDate,
	hideIcon,
	disableSearch,
	placeholder,
	query,
	fetchKeysLazyQuery,
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
	const [getKeys, { data: keysData, loading: keysLoading }] =
		fetchKeysLazyQuery()
	const [getKeyValues, { data, loading: valuesLoading }] =
		fetchValuesLazyQuery()
	const [cursorIndex, setCursorIndex] = useState(0)

	// TODO: Remove queryTerms and only use tokenGroups. See #7298 for details.
	const queryTerms = parseSearchQuery(query)
	const { tokenGroups } = parseSearch(query)
	const activeTermIndex = getActiveTermIndex(cursorIndex, queryTerms)
	const activeTerm = queryTerms[activeTermIndex]
	const debouncedKeyValue = useDebouncedValue<string>(activeTerm.value)

	// TODO: code smell, user is not able to use "message" as a search key
	// because we are reserving it for the body implicitly
	const showValues =
		activeTerm.key !== BODY_KEY &&
		!!keysData?.keys?.find((k) => k.name === activeTerm.key)
	const loading = showValues ? valuesLoading : keysLoading
	const showTermSelect = !!activeTerm.value.length

	const values = data?.key_values

	const visibleItems = showValues
		? getVisibleValues(activeTerm, values)
		: getVisibleKeys(query, queryTerms, activeTerm, keysData?.keys)

	// Limit number of items shown
	visibleItems.length = Math.min(MAX_ITEMS, visibleItems.length)

	const showResults = loading || visibleItems.length > 0 || showTermSelect
	const isDirty = query !== ''

	const submitQuery = (query: string) => {
		onFormSubmit(query)
	}

	const handleSetCursorIndex = () => {
		setCursorIndex(inputRef.current?.selectionStart || 0)
	}

	useEffect(() => {
		if (showValues) {
			return
		}

		getKeys({
			variables: {
				project_id: project_id!,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: debouncedKeyValue,
			},
		})
	}, [debouncedKeyValue, showValues, startDate, endDate, project_id, getKeys])

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
		const prefix = activeTerm.value.startsWith('-') ? '-' : ''

		if (isValueSelect) {
			queryTerms[activeTermIndex].value = !!noQuotes
				? key
				: `${prefix}${quoteQueryValue(key)}`
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
		}

		comboboxStore.setActiveId(null)
		comboboxStore.setState('moves', 0)
	}

	const handleRemoveItem = (index: number) => {
		const groups = [...tokenGroups]
		const hasTrailingWhitespace = groups[index + 1]?.[0]?.text.trim() === ''
		const numItemsToRemove = hasTrailingWhitespace ? 2 : 1
		groups.splice(index, numItemsToRemove)
		const newQuery = groups
			.flat()
			.map((t) => t.text)
			.join('')
		setQuery(newQuery)
		submitQuery(newQuery)
	}

	let currentIndex = 0

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
					{tokenGroups.map((group, index) => {
						const term = group.map((token) => token.text).join('')
						const nextIndex = currentIndex + term.length
						const active =
							cursorIndex >= currentIndex &&
							cursorIndex <= nextIndex
						currentIndex = nextIndex

						return (
							<TermTag
								key={index}
								term={term}
								index={index}
								active={active}
								tokens={group}
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
					className={clsx(styles.combobox, {
						[styles.comboboxNotEmpty]: query.length > 0,
					})}
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
					onKeyUp={handleSetCursorIndex}
					onMouseUp={handleSetCursorIndex}
					style={{
						paddingLeft: hideIcon ? undefined : 40,
					}}
					data-hl-record
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
					<Box pt="3">
						<Combobox.GroupLabel store={comboboxStore}>
							{activeTerm.value && (
								<Combobox.Item
									className={styles.comboboxItem}
									onClick={() =>
										handleItemSelect(activeTerm.value, true)
									}
									store={comboboxStore}
								>
									<Stack direction="row" gap="4">
										{activeTerm.key === BODY_KEY ? (
											<>
												<Text lines="1" color="weak">
													Show all results for
												</Text>{' '}
												<Text>
													&lsquo;{activeTerm.value}
													&rsquo;
												</Text>
											</>
										) : (
											<Text>{activeTerm.value}</Text>
										)}
									</Stack>
								</Combobox.Item>
							)}
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
						position="absolute"
						style={{
							bottom: 0,
							left: 0,
							right: 0,
						}}
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
							<LinkButton
								trackingId="search-form_search-specification-docs-link"
								to="https://www.highlight.io/docs/general/product-features/logging/log-search#attributes-search"
								target="_blank"
								size="xSmall"
								kind="secondary"
								emphasis="high"
								iconRight={<IconSolidExternalLink />}
							>
								View docs
							</LinkButton>
						</Box>
					</Box>
				</Combobox.Popover>
			)}
		</Box>
	)
}

const SEPARATORS = SearchGrammarParser.literalNames.map((name) =>
	name?.replaceAll("'", ''),
)

const TermTag: React.FC<{
	active: boolean
	index: number
	term: string
	tokens: SearchToken[]
	onRemoveItem: (index: number) => void
}> = ({ active, index, term, tokens, onRemoveItem }) => {
	if (term.trim().length === 0) {
		return <span>{term}</span>
	}

	return (
		<>
			<Box
				cssClass={clsx(styles.comboboxTag, {
					[styles.comboboxTagActive]: active,
				})}
				py="6"
				position="relative"
				whiteSpace="nowrap"
			>
				<IconSolidXCircle
					className={styles.comboboxTagClose}
					size={13}
					onClick={() => onRemoveItem(index)}
				/>
				{tokens.map((token, index) => {
					const { text } = token
					const key = `${text}-${index}`

					if (SEPARATORS.includes(text)) {
						return (
							<Box
								key={key}
								style={{ color: '#E93D82', zIndex: 1 }}
							>
								{text}
							</Box>
						)
					} else {
						return (
							<Box key={key} style={{ zIndex: 1 }}>
								{text}
							</Box>
						)
					}
				})}

				<Box cssClass={styles.comboboxTagBackground} />
			</Box>
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
	const activeTerm = activeQueryTerm.value.replace('-', '')

	return (
		values?.filter(
			(v) =>
				// Don't filter if no value has been typed
				!activeTerm.length ||
				// Exclude the current term since that is given special treatment
				(v !== activeTerm &&
					// Return values that match the query term
					v.indexOf(activeTerm) > -1),
		) || []
	)
}
