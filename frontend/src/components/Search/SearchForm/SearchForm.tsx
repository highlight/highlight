import { useSavedSegments } from '@components/Search/useSavedSegments'
import { GetKeysQuery } from '@graph/operations'
import {
	Badge,
	Box,
	Combobox,
	DateRangePicker,
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	IconSolidClock,
	IconSolidExternalLink,
	IconSolidPlus,
	IconSolidSearch,
	IconSolidSwitchVertical,
	IconSolidXCircle,
	Stack,
	Text,
	useComboboxStore,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import moment from 'moment'
import { stringify } from 'query-string'
import React, { useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-autosize-textarea'
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
	quoteQueryValue,
	stringifySearchQuery,
} from '@/components/Search/SearchForm/utils'
import { parseSearch } from '@/components/Search/utils'
import {
	useGetKeysLazyQuery,
	useGetKeyValuesLazyQuery,
} from '@/graph/generated/hooks'
import { ProductType } from '@/graph/generated/schemas'
import { useDebounce } from '@/hooks/useDebounce'

import * as styles from './SearchForm.css'

export const QueryParam = withDefault(StringParam, '')
export const FixedRangePreset = DEFAULT_TIME_PRESETS[0]
export const PermalinkPreset = DEFAULT_TIME_PRESETS[5]

type Keys = GetKeysQuery['keys']
type SearchResult = Keys[0] | OperatorResult | ValueResult
type OperatorResult = { name: SearchOperator; type: 'Operator' }
type ValueResult = { name: string; type: 'Value' }

const MAX_ITEMS = 25

const EXISTS_OPERATORS = ['EXISTS', 'NOT EXISTS'] as const
const NUMERIC_OPERATORS = ['>', '>=', '<', '<='] as const
const BOOLEAN_OPERATORS = ['=', '!='] as const
const CONTAINS_OPERATOR = ['=**', '!=**'] as const
const MATCHES_OPERATOR = ['=//', '!=//'] as const
export const SEARCH_OPERATORS = [
	...BOOLEAN_OPERATORS,
	...NUMERIC_OPERATORS,
	...EXISTS_OPERATORS,
	...CONTAINS_OPERATOR,
	...MATCHES_OPERATOR,
] as const
export type SearchOperator = typeof SEARCH_OPERATORS[number]

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
	productType: ProductType
	disableSearch?: boolean
	actions?: React.FC<{
		query: string
		startDate: Date
		endDate: Date
	}>
	hideDatePicker?: boolean
	hideCreateAlert?: boolean
	savedSegmentType?: 'Trace' | 'Log'
	textAreaRef?: React.RefObject<HTMLTextAreaElement>
}

const SearchForm: React.FC<SearchFormProps> = ({
	initialQuery,
	startDate,
	endDate,
	selectedPreset,
	productType,
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
	textAreaRef,
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

	const displaySeparator =
		!!SegmentMenu && (!!actions || !hideCreateAlert || !hideDatePicker)

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
					textAreaRef={textAreaRef}
					productType={productType}
					setQuery={setQuery}
					onFormSubmit={onFormSubmit}
				/>
				<Box display="flex" pr="8" py="6" gap="6">
					{SegmentMenu}
					{displaySeparator && (
						<Box
							as="span"
							borderRight="dividerWeak"
							mt="4"
							style={{ height: 18 }}
						/>
					)}
					{!hideCreateAlert && (
						<Button
							kind="secondary"
							trackingId={`${
								savedSegmentType?.toLowerCase() ?? 'logs'
							}_create-alert_click`}
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
					{actions && actions({ query, startDate, endDate })}
					{!hideDatePicker && (
						<DateRangePicker
							emphasis="medium"
							iconLeft={<IconSolidClock />}
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
				</Box>
			</Box>
		</>
	)
}

export { SearchForm }

export const DEFAULT_INPUT_HEIGHT = 31

export const Search: React.FC<{
	initialQuery: string
	startDate: Date
	endDate: Date
	hideIcon?: boolean
	disableSearch?: boolean
	placeholder?: string
	query: string
	productType: ProductType
	setQuery: (value: string) => void
	onFormSubmit: (query: string) => void
	textAreaRef?: React.RefObject<HTMLTextAreaElement>
}> = ({
	initialQuery,
	startDate,
	endDate,
	hideIcon,
	disableSearch,
	placeholder,
	query,
	textAreaRef,
	productType,
	setQuery,
	onFormSubmit,
}) => {
	const { project_id } = useParams()
	const containerRef = useRef<HTMLDivElement | null>(null)
	const defaultInputRef = useRef<HTMLTextAreaElement | null>(null)
	const inputRef = textAreaRef || defaultInputRef
	const [keys, setKeys] = useState<Keys | undefined>()
	const [values, setValues] = useState<string[] | undefined>()
	const comboboxStore = useComboboxStore({
		defaultValue: query ?? '',
	})
	const [getKeys, { loading: keysLoading }] = useGetKeysLazyQuery()
	const [getKeyValues, { loading: valuesLoading }] =
		useGetKeyValuesLazyQuery()
	const [cursorIndex, setCursorIndex] = useState(0)
	const [isPending, startTransition] = React.useTransition()

	const { queryParts, tokens } = parseSearch(query)
	const tokenGroups = buildTokenGroups(tokens)
	const activePart = getActivePart(cursorIndex, queryParts)
	const { debouncedValue, setDebouncedValue } = useDebounce<string>(
		activePart.value,
	)

	// TODO: code smell, user is not able to use "message" as a search key
	// because we are reserving it for the body implicitly
	const showValues =
		activePart.key !== BODY_KEY &&
		activePart.text.includes(`${activePart.key}${activePart.operator}`)
	const loading = showValues ? valuesLoading : keysLoading
	const showValueSelect =
		activePart.text === `${activePart.key}${activePart.operator}` ||
		!!activePart.value?.length

	let visibleItems: SearchResult[] = showValues
		? getVisibleValues(activePart, values)
		: getVisibleKeys(query, activePart, keys)
	const comboboxItems = comboboxStore.useState('items')

	// Show operators when we have an exact match for a key
	const keyMatch = visibleItems.find((item) => item.name === activePart.text)
	const showOperators = !!keyMatch

	if (showOperators) {
		const operators =
			keyMatch.type === 'Numeric'
				? [
						...BOOLEAN_OPERATORS,
						...NUMERIC_OPERATORS,
						...EXISTS_OPERATORS,
				  ]
				: [
						...BOOLEAN_OPERATORS,
						...EXISTS_OPERATORS,
						...CONTAINS_OPERATOR,
						...MATCHES_OPERATOR,
				  ]

		visibleItems = operators.map((operator) => ({
			name: operator,
			type: 'Operator',
		}))
	}

	// Limit number of items shown.
	visibleItems.length = Math.min(MAX_ITEMS, visibleItems.length)

	const showResults = loading || visibleItems.length > 0 || showValueSelect
	const isDirty = query !== ''

	const submitQuery = (query: string) => {
		onFormSubmit(query)
	}

	const handleSetCursorIndex = () => {
		if (!isPending) {
			setCursorIndex(inputRef.current?.selectionStart ?? query.length)
		}
	}

	useEffect(() => {
		if (showValues) {
			return
		}

		getKeys({
			variables: {
				product_type: productType,
				project_id: project_id!,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: debouncedValue,
			},
			fetchPolicy: 'cache-first',
			onCompleted: (data) => {
				setKeys(data.keys)
			},
		})
	}, [
		debouncedValue,
		showValues,
		startDate,
		endDate,
		project_id,
		getKeys,
		productType,
	])

	useEffect(() => {
		// When we transition to a new key we don't want to wait for the debounce
		// delay to update the value for key fetching.
		if (activePart.value === '' && activePart.key === BODY_KEY) {
			setDebouncedValue('')
		}
	}, [activePart.key, activePart.value, setDebouncedValue])

	useEffect(() => {
		if (!showValues) {
			return
		}

		getKeyValues({
			variables: {
				product_type: productType,
				project_id: project_id!,
				key_name: activePart.key,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
			},
			fetchPolicy: 'cache-first',
			onCompleted: (data) => {
				setValues(data.key_values)
			},
		})
	}, [
		activePart.key,
		endDate,
		getKeyValues,
		productType,
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
		// Ensure the cursor is placed in the correct position after update the
		// query from selecting a dropdown item.
		inputRef.current?.setSelectionRange(cursorIndex, cursorIndex)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query])

	useEffect(() => {
		// Logic for selecting a default item from the results. We don't want to
		// select a value by default, but if there is a query, an item isn't
		// currently selected, and there are items, select the first item.
		const { activeId, items } = comboboxStore.getState()
		// Give preference to the "Show all results for..." item if it exists.
		const firstItem = items.find((i) => i.value === undefined) ?? items[0]
		const noActiveId = !activeId || !items.find((i) => i.id === activeId)

		if (activePart.text.trim() !== '' && noActiveId && firstItem) {
			comboboxStore.setActiveId(firstItem.id)
			comboboxStore.setState('moves', 0)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comboboxItems, query])

	useEffect(() => {
		if (!showValues) {
			setValues(undefined)
		}
	}, [showValues])

	const handleItemSelect = (item: SearchResult) => {
		const isValueSelect = item.type === 'Value'
		let cursorShift = 0

		if (item.type === 'Operator') {
			const isExists = !!EXISTS_OPERATORS.find((eo) => eo === item.name)
			const space = isExists ? ' ' : ''

			const isContainsOrMatches = !![
				...CONTAINS_OPERATOR,
				...MATCHES_OPERATOR,
			].find((o) => o === item.name)
			if (isContainsOrMatches) {
				cursorShift = -1
			}

			const key =
				activePart.key === BODY_KEY ? activePart.text : activePart.key

			activePart.operator = item.name
			activePart.text = `${key}${space}${activePart.operator}`
			activePart.stop = activePart.start + activePart.text.length
		} else if (isValueSelect) {
			activePart.value = quoteQueryValue(item.name)
			activePart.text = `${activePart.key}${activePart.operator}${activePart.value}`
			activePart.stop = activePart.start + activePart.text.length
		} else {
			activePart.key = item.name
			activePart.text = item.name
			activePart.value = ''
			activePart.stop = activePart.start + activePart.key.length
		}

		const newQuery = stringifySearchQuery(queryParts)
		const newCursorPosition = activePart.stop + cursorShift

		startTransition(() => {
			setQuery(newQuery)
			setCursorIndex(newCursorPosition)

			if (isValueSelect) {
				submitQuery(newQuery)
				comboboxStore.setOpen(false)
			}
		})

		comboboxStore.setActiveId(null)
		comboboxStore.setState('moves', 0)
	}

	const handleRemoveItem = (index: number) => {
		let newTokenGroups = [...tokenGroups]
		newTokenGroups.splice(index, 1)
		newTokenGroups = newTokenGroups.filter((group) => {
			// filter out groups where the only tokens are whitespace
			return group.tokens.some((token) => token.text.trim() !== '')
		})
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
			.join(' ')
			.trim()

		setQuery(newQuery)
		submitQuery(newQuery)
	}

	const submitAndBlur = () => {
		submitQuery(query)
		comboboxStore.setOpen(false)
		inputRef.current?.blur()
		handleSetCursorIndex()
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
				alignItems="flex-start"
				gap="6"
				pt="6"
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
							<QueryPart
								key={index}
								comboboxStore={comboboxStore}
								cursorIndex={cursorIndex}
								index={index}
								tokenGroup={tokenGroup}
								showValues={showValues}
								onRemoveItem={handleRemoveItem}
							/>
						)
					})}
				</Box>
				<Combobox
					disabled={disableSearch}
					store={comboboxStore}
					name="search"
					placeholder={placeholder ?? 'Search...'}
					className={clsx(styles.combobox, {
						[styles.comboboxNotEmpty]: query.length > 0,
					})}
					render={
						<TextareaAutosize
							ref={inputRef}
							style={{ resize: 'none', overflowY: 'hidden' }}
						/>
					}
					value={query}
					onChange={(e) => {
						// Need to update cursor position before updating the query for all
						// cursor-based logic to work.
						handleSetCursorIndex()

						// Need to set this bit of React state to force a re-render of the
						// component. For some reason the combobox value isn't updated until
						// after a delay or blurring the input. We also trim any leading
						// space characters since this produces some UI jank.
						setQuery(e.target.value.replace(/^\s+/, ''))
					}}
					onBlur={() => {
						submitQuery(query)
						handleSetCursorIndex()
						inputRef.current?.blur()
					}}
					onKeyDown={(e) => {
						if (e.key === 'Escape') {
							submitAndBlur()
						}

						if (
							!isPending &&
							e.key === 'Enter' &&
							// Using isPending to prevent blurring when the user is selecting
							// an item vs submitting the form.
							(query === '' || !showResults || !isPending)
						) {
							e.preventDefault()
							submitAndBlur()
						}
					}}
					onKeyUp={handleSetCursorIndex}
					onMouseUp={handleSetCursorIndex}
					style={{
						paddingLeft: hideIcon ? undefined : 40,
						top: 6,
					}}
					data-hl-record
				/>

				{isDirty && !disableSearch && (
					<Box pt="6">
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
					</Box>
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
					<Box cssClass={styles.comboboxResults}>
						{activePart.value?.length > 0 && (
							<Combobox.Group
								className={styles.comboboxGroup}
								store={comboboxStore}
							>
								<Combobox.Item
									className={styles.comboboxItem}
									onClick={submitAndBlur}
									store={comboboxStore}
								>
									<Stack direction="row" gap="4">
										<Text
											lines="1"
											color="weak"
											size="small"
										>
											Show all results for
										</Text>{' '}
										<Text
											color="secondaryContentText"
											size="small"
										>
											<>
												&lsquo;
												{activePart.key === BODY_KEY
													? activePart.value
													: activePart.text}
												&rsquo;
											</>
										</Text>
									</Stack>
								</Combobox.Item>
							</Combobox.Group>
						)}
						{loading && visibleItems.length === 0 && (
							<Combobox.Group
								className={styles.comboboxGroup}
								store={comboboxStore}
							>
								<Combobox.Item
									className={styles.comboboxItem}
									disabled
								>
									<Text color="secondaryContentText">
										Loading...
									</Text>
								</Combobox.Item>
							</Combobox.Group>
						)}
						{visibleItems.length > 0 && (
							<Combobox.Group
								className={styles.comboboxGroup}
								store={comboboxStore}
							>
								{!showValues && !showOperators && (
									<Combobox.GroupLabel store={comboboxStore}>
										<Box px="10" py="6">
											<Text
												color="moderate"
												size="xxSmall"
											>
												Filters
											</Text>
										</Box>
									</Combobox.GroupLabel>
								)}
								{visibleItems.map((key, index) => {
									const badgeText =
										getSearchResultBadgeText(key)

									return (
										<Combobox.Item
											className={styles.comboboxItem}
											key={index}
											onClick={() =>
												handleItemSelect(key)
											}
											store={comboboxStore}
											value={key.name}
											hideOnClick={false}
											setValueOnClick={false}
											title={key.name}
										>
											<Text
												color="secondaryContentText"
												lines="1"
											>
												{key.name}
											</Text>
											{badgeText && (
												<Badge label={badgeText} />
											)}
										</Combobox.Item>
									)
								})}
							</Combobox.Group>
						)}
					</Box>
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
		const lastPartStop = Math.max(
			queryParts[queryParts.length - 1]?.stop + 1,
			cursorIndex,
		)

		const activePart = {
			key: BODY_KEY,
			operator: DEFAULT_OPERATOR,
			value: '',
			text: '',
			start: lastPartStop,
			stop: lastPartStop,
		}
		queryParts.push(activePart)
		return activePart
	} else {
		return queryParts[activePartIndex]
	}
}

const getVisibleKeys = (
	queryText: string,
	activeQueryPart?: SearchExpression,
	keys?: Keys,
) => {
	const startingNewPart = queryText.endsWith(' ')

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
): SearchResult[] => {
	const activePart = activeQueryPart?.value ?? ''
	const filteredValues =
		values?.filter(
			(v) =>
				// Don't filter if no value has been typed
				!activePart.length ||
				// Return values that match the query part
				v.indexOf(activePart) > -1,
		) || []

	return filteredValues.map((value) => ({
		name: value,
		type: 'Value',
	}))
}

const getSearchResultBadgeText = (key: SearchResult) => {
	if (key.type === 'Operator') {
		switch (key.name) {
			case '=':
				return 'is'
			case '!=':
				return 'is not'
			case '>':
				return 'greater'
			case '>=':
				return 'greater or equal'
			case '<':
				return 'smaller'
			case '<=':
				return 'smaller or equal'
			case 'EXISTS':
				return 'exists'
			case 'NOT EXISTS':
				return 'does not exist'
			case '=**':
				return 'contains'
			case '!=**':
				return 'does not contain'
			case '=//':
				return 'matches'
			case '!=//':
				return 'does not match'
		}
	} else if (key.type === 'Value') {
		return undefined
	} else {
		return key.type?.toLowerCase()
	}
}
