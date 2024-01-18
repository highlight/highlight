import { useSavedSegments } from '@components/Search/useSavedSegments'
import { GetLogsKeysQuery, GetTracesKeysQuery } from '@graph/operations'
import {
	Badge,
	Box,
	Combobox,
	DateRangePicker,
	DateRangePreset,
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
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	DateTimeParam,
	encodeQueryParams,
	StringParam,
	withDefault,
} from 'use-query-params'

import { Button } from '@/components/Button'
import { LinkButton } from '@/components/LinkButton'
import SearchGrammarParser from '@/components/Search/Parser/antlr/SearchGrammarParser'
import { SearchExpression } from '@/components/Search/Parser/listener'
import {
	TIME_FORMAT,
	TIME_MODE,
} from '@/components/Search/SearchForm/constants'
import { QueryPart } from '@/components/Search/SearchForm/QueryPart'
import {
	BODY_KEY,
	buildTokenGroups,
	DEFAULT_OPERATOR,
	stringifySearchQuery,
} from '@/components/Search/SearchForm/utils'
import { parseSearch } from '@/components/Search/utils'
import {
	useGetLogsKeysLazyQuery,
	useGetLogsKeyValuesLazyQuery,
	useGetTracesKeysLazyQuery,
	useGetTracesKeyValuesLazyQuery,
} from '@/graph/generated/hooks'
import { KeyType } from '@/graph/generated/schemas'

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

export const SEARCH_OPERATORS = ['=', '!=', '>', '>=', '<', '<=']

export type SearchFormProps = {
	onFormSubmit: (query: string) => void
	initialQuery: string
	startDate: Date
	endDate: Date
	selectedPreset?: DateRangePreset
	onDatesChange: (
		startDate: Date,
		endDate: Date,
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
	selectedPreset,
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
							selectedValue={{
								startDate,
								endDate,
								selectedPreset,
							}}
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

	const { queryParts, tokens } = parseSearch(query)
	const tokenGroups = buildTokenGroups(tokens, queryParts, query)
	const activePart = getActivePart(cursorIndex, queryParts)
	const debouncedKeyValue = useDebouncedValue<string>(activePart.value)

	// TODO: code smell, user is not able to use "message" as a search key
	// because we are reserving it for the body implicitly
	const showValues =
		activePart.key !== BODY_KEY &&
		activePart.text.includes(`${activePart.key}${activePart.operator}`)
	const loading = showValues ? valuesLoading : keysLoading
	const showPartSelect = !!activePart.value?.length

	const values = data?.key_values

	const visibleItems = showValues
		? getVisibleValues(activePart, values)
		: getVisibleKeys(query, queryParts, activePart, keysData?.keys)

	// Limit number of items shown
	visibleItems.length = Math.min(MAX_ITEMS, visibleItems.length)

	const showResults = loading || visibleItems.length > 0 || showPartSelect
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
				key_name: activePart.key,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
			},
		})
	}, [
		activePart.key,
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

	const handleItemSelect = (key: Keys[0] | string) => {
		const isValueSelect = typeof key === 'string'
		const value = isValueSelect ? key : key.name
		const isLastPart =
			activePart.stop >= (queryParts[queryParts.length - 1]?.stop ?? 0)

		if (isValueSelect) {
			activePart.value = value
			activePart.text = `${activePart.key}${activePart.operator}${value}`
		} else {
			activePart.key = value
			activePart.operator = DEFAULT_OPERATOR
			activePart.text = `${value}${DEFAULT_OPERATOR}`
			activePart.value = ''
		}

		const newCursorPosition =
			activePart.start +
			activePart.key.length +
			activePart.operator.length +
			activePart.value.length

		let newQuery = stringifySearchQuery(queryParts)

		// Add space if it's the last part and a value is selected so people can
		// start entering the next part.
		isLastPart && isValueSelect && !newQuery.endsWith(' ')
			? (newQuery += ' ')
			: null

		setQuery(newQuery)

		if (isValueSelect) {
			submitQuery(newQuery)
		}

		comboboxStore.setActiveId(null)
		comboboxStore.setState('moves', 0)

		if (!isLastPart) {
			// Move cursor to end of selected value if not editing the last part.
			setTimeout(() => {
				inputRef.current?.setSelectionRange(
					newCursorPosition,
					newCursorPosition,
				)

				setCursorIndex(newCursorPosition)
			}, 0)
		}
	}

	const handleRemoveItem = (index: number) => {
		const newTokenGroups = [...tokenGroups]
		newTokenGroups.splice(index, 1)
		const newQuery = newTokenGroups
			.map((tokenGroup) =>
				tokenGroup.tokens
					.map((token) =>
						token.type === SearchGrammarParser.EOF
							? ''
							: token.text,
					)
					.join(''),
			)
			.join('')
			.trim()

		setQuery(newQuery)
		submitQuery(newQuery)
	}

	const submitAndBlur = () => {
		submitQuery(query)
		comboboxStore.setOpen(false)
		inputRef.current?.blur()
		setCursorIndex(-1)
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
					{tokenGroups.map((tokenGroup, index) => {
						if (tokenGroup.tokens.length === 0) {
							return null
						}

						return (
							<Fragment key={index}>
								<QueryPart
									cursorIndex={cursorIndex}
									index={index}
									tokenGroup={tokenGroup}
									showValues={showValues}
									onRemoveItem={handleRemoveItem}
								/>
							</Fragment>
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
						setCursorIndex(-1)
						inputRef.current?.blur()
					}}
					onKeyDown={(e) => {
						if (e.key === 'Escape') {
							submitAndBlur()
						}

						if (e.key === 'Enter' && query === '') {
							e.preventDefault()
							submitAndBlur()
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
							{activePart.value && (
								<Combobox.Item
									className={styles.comboboxItem}
									onClick={() => {
										if (activePart.key === BODY_KEY) {
											submitAndBlur()
											return
										}

										handleItemSelect(
											showValues
												? activePart.value
												: {
														name: activePart.value,
														type: KeyType.String,
														__typename: 'QueryKey',
												  },
										)
									}}
									store={comboboxStore}
								>
									<Stack direction="row" gap="4">
										{activePart.key === BODY_KEY ? (
											<>
												<Text lines="1" color="weak">
													Show all results for
												</Text>{' '}
												<Text>
													&lsquo;{activePart.value}
													&rsquo;
												</Text>
											</>
										) : (
											<Text>{activePart.value}</Text>
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
										<Text>{key.name}</Text>{' '}
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
								to="https://www.highlight.io/docs/general/product-features/general-features/search"
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

const getActivePart = (
	cursorIndex: number,
	queryParts: SearchExpression[],
): SearchExpression => {
	let activePartIndex

	queryParts.find((param, index) => {
		if (param.stop < cursorIndex - 1) {
			return false
		}

		activePartIndex = index
		return true
	})

	if (activePartIndex === undefined) {
		const activePart = {
			key: BODY_KEY,
			operator: DEFAULT_OPERATOR,
			value: '',
			text: '',
			start: 1,
			stop: 1,
		}
		queryParts.push(activePart)
		return activePart
	} else {
		return queryParts[activePartIndex]
	}
}

const getVisibleKeys = (
	queryText: string,
	queryParts: SearchExpression[],
	activeQueryPart?: SearchExpression,
	keys?: Keys,
) => {
	const startingNewPart = queryText.endsWith(' ')
	const activePartKeys = queryParts.map((part) => part.key)
	keys = keys?.filter((key) => activePartKeys.indexOf(key.name) === -1)

	return (
		keys?.filter(
			(key) =>
				// If it's a new part, don't filter results.
				startingNewPart ||
				// Only filter for body queries
				(activeQueryPart?.key === BODY_KEY &&
					// Don't filter if no query part
					(!activeQueryPart.value?.length ||
						startingNewPart ||
						// Filter empty results
						(key.name.length > 0 &&
							// Only show results that contain the part
							key.name.indexOf(activeQueryPart.value) > -1))),
		) || []
	)
}

const getVisibleValues = (
	activeQueryPart?: SearchExpression,
	values?: string[],
) => {
	const activePart = activeQueryPart?.value ?? ''

	return (
		values?.filter(
			(v) =>
				// Don't filter if no value has been typed
				!activePart.length ||
				// Exclude the current part since that is given special treatment
				(v !== activePart &&
					// Return values that match the query part
					v.indexOf(activePart) > -1),
		) || []
	)
}
