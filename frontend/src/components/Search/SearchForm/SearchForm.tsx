import {
	Badge,
	Box,
	Combobox,
	DateRangePicker,
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	IconSolidBell,
	IconSolidChartBar,
	IconSolidChartSquareLine,
	IconSolidCheveronDown,
	IconSolidClock,
	IconSolidExternalLink,
	IconSolidSearch,
	IconSolidSparkles,
	IconSolidSwitchVertical,
	IconSolidXCircle,
	Menu,
	Stack,
	Text,
	useComboboxStore,
} from '@highlight-run/ui/components'
import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-autosize-textarea'
import { useNavigate } from 'react-router-dom'
import { StringParam, useQueryParam, withDefault } from 'use-query-params'
import { debounce } from 'lodash'

import { useSavedSegments } from '@components/Search/useSavedSegments'
import { GetKeysQuery } from '@graph/operations'
import { useProjectId } from '@hooks/useProjectId'
import { useParams } from '@util/react-router/useParams'
import { LinkButton } from '@/components/LinkButton'
import LoadingBox from '@/components/LoadingBox'
import SearchGrammarParser from '@/components/Search/Parser/antlr/SearchGrammarParser'
import { SearchExpression } from '@/components/Search/Parser/listener'
import {
	SORT_COLUMN,
	SORT_DIRECTION,
	useSearchContext,
} from '@/components/Search/SearchContext'
import {
	AI_SEARCH_PLACEHOLDERS,
	TIME_FORMAT,
	TIME_MODE,
} from '@/components/Search/SearchForm/constants'
import { QueryPart } from '@/components/Search/SearchForm/QueryPart'
import {
	BODY_KEY,
	getActivePart,
	quoteQueryValue,
} from '@/components/Search/SearchForm/utils'
import {
	useGetKeysLazyQuery,
	useGetKeyValuesLazyQuery,
} from '@/graph/generated/hooks'
import { ProductType, SavedSegmentEntityType } from '@/graph/generated/schemas'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import { btoaSafe } from '@/util/string'

import { SearchEntry } from './hooks'
import { AiSearch } from './AiSearch'
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
const EQUAL_OPERATOR = ['='] as const
const BOOLEAN_OPERATORS = ['=', '!='] as const
const CONTAINS_OPERATOR = ['="**"', '!="**"'] as const
const MATCHES_OPERATOR = ['="//"', '!="//"'] as const
export const SEARCH_OPERATORS = [
	...BOOLEAN_OPERATORS,
	...NUMERIC_OPERATORS,
	...EXISTS_OPERATORS,
	...CONTAINS_OPERATOR,
	...MATCHES_OPERATOR,
] as const
export type SearchOperator = (typeof SEARCH_OPERATORS)[number]

type Creatable = {
	label: string
	value: string
}

export type SearchFormProps = {
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
	actions?: (props: {
		query: string
		startDate: Date
		endDate: Date
	}) => React.ReactNode
	hideDatePicker?: boolean
	hideCreateAlert?: boolean
	savedSegmentType?: SavedSegmentEntityType
	isPanelView?: boolean
	resultFormatted?: string
	loading?: boolean
	creatables?: { [key: string]: Creatable }
	enableAIMode?: boolean
	aiSupportedSearch?: boolean
}

const SearchForm: React.FC<SearchFormProps> = ({
	startDate,
	endDate,
	selectedPreset,
	productType,
	onDatesChange,
	presets,
	minDate,
	timeMode,
	actions,
	hideDatePicker,
	hideCreateAlert,
	savedSegmentType,
	isPanelView,
	resultFormatted,
	loading,
	creatables,
	enableAIMode,
	aiSupportedSearch,
}) => {
	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const { query, setQuery, onSubmit, aiMode } = useSearchContext()

	const handleQueryChange = (query?: string) => {
		const updatedQuery = query ?? ''
		setQuery(updatedQuery)
		onSubmit(updatedQuery)
	}

	const { SegmentMenu, SegmentModals } = useSavedSegments({
		query,
		setQuery: handleQueryChange,
		entityType: savedSegmentType,
		projectId,
	})

	const DatePickerComponent = hideDatePicker ? null : (
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
	)

	const ActionsComponent = !actions ? null : (
		<Box>{actions({ query, startDate, endDate })}</Box>
	)

	const SearchComponent = (
		<Search
			startDate={startDate}
			endDate={endDate}
			productType={productType}
			hideIcon={isPanelView}
			hasAdditonalActions={!hideCreateAlert || !hideDatePicker}
			creatables={creatables}
			enableAIMode={enableAIMode}
			aiSupportedSearch={aiSupportedSearch}
		/>
	)

	const MonitorComponent = hideCreateAlert ? null : (
		<Menu placement="bottom-end">
			<Menu.Button
				onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
					e.stopPropagation()
				}}
				iconRight={<IconSolidCheveronDown size={14} />}
				iconLeft={<IconSolidChartSquareLine size={14} />}
				kind="secondary"
				emphasis="low"
				disabled={!query}
			>
				Monitor
			</Menu.Button>
			<Menu.List>
				<Menu.Item
					onClick={() => {
						navigate({
							pathname: `/${projectId}/dashboards/new`,
							search: `settings=${btoaSafe(
								JSON.stringify({ productType, query }),
							)}`,
						})
					}}
				>
					<Stack gap="4" direction="row" align="center">
						<IconSolidChartBar />
						Create Dashboard
					</Stack>
				</Menu.Item>
				<Menu.Item
					onClick={() => {
						navigate({
							pathname: `/${projectId}/alerts/new`,
							search: `settings=${btoaSafe(
								JSON.stringify({ productType, query }),
							)}`,
						})
					}}
				>
					<Stack gap="4" direction="row" align="center">
						<IconSolidBell />
						Create Alert
					</Stack>
				</Menu.Item>
			</Menu.List>
		</Menu>
	)

	if (isPanelView) {
		return (
			<>
				{aiMode ? (
					<AiSearch
						placeholder={AI_SEARCH_PLACEHOLDERS[productType]}
						panelView
					/>
				) : (
					<>
						{SegmentModals}
						<Stack
							alignItems="flex-start"
							gap="8"
							width="full"
							p="8"
						>
							<Stack
								flexDirection="row"
								justifyContent="space-between"
								width="full"
							>
								{DatePickerComponent}
								{ActionsComponent}
							</Stack>
							<Stack
								gap="0"
								border="dividerWeak"
								borderRadius="6"
								width="full"
							>
								<Box
									background="white"
									borderTopLeftRadius="4"
									borderTopRightRadius="4"
								>
									{SearchComponent}
								</Box>
								<Box borderBottom="dividerWeak" />
								<Stack
									flexDirection="row"
									borderBottomLeftRadius="4"
									borderBottomRightRadius="4"
									justifyContent="space-between"
									py="6"
									pl="8"
									pr="4"
								>
									<Box display="flex" alignItems="center">
										{loading ? (
											<LoadingBox />
										) : resultFormatted ? (
											<Text color="weak">
												{resultFormatted}
											</Text>
										) : null}
									</Box>
									{SegmentMenu}
								</Stack>
							</Stack>
						</Stack>
					</>
				)}
			</>
		)
	}

	const displaySeparator =
		(!!SegmentMenu || !hideCreateAlert) && (!!actions || !hideDatePicker)

	return (
		<>
			{SegmentModals}
			<Box
				alignItems="stretch"
				display="flex"
				width="full"
				borderBottom="dividerWeak"
			>
				{aiMode ? (
					<AiSearch
						placeholder={AI_SEARCH_PLACEHOLDERS[productType]}
					/>
				) : (
					<>
						{SearchComponent}
						<Box
							alignItems="flex-start"
							display="flex"
							pr="8"
							py="6"
							gap="6"
						>
							{MonitorComponent}
							{SegmentMenu}
							{displaySeparator && (
								<Box
									as="span"
									borderRight="dividerWeak"
									style={{ marginTop: 5, height: 18 }}
								/>
							)}
							{ActionsComponent}
							{DatePickerComponent}
						</Box>
					</>
				)}
			</Box>
		</>
	)
}

export { SearchForm }

export const Search: React.FC<{
	startDate: Date
	endDate: Date
	hideIcon?: boolean
	placeholder?: string
	productType: ProductType
	hasAdditonalActions?: boolean
	creatables?: { [key: string]: Creatable }
	defaultValueOptions?: string[]
	enableAIMode?: boolean
	aiSupportedSearch?: boolean
	event?: string
}> = ({
	startDate,
	endDate,
	hideIcon,
	placeholder,
	productType,
	hasAdditonalActions,
	creatables,
	defaultValueOptions,
	enableAIMode,
	aiSupportedSearch,
	event,
}) => {
	const {
		disabled,
		initialQuery,
		query,
		queryParts,
		tokenGroups,
		onSubmit,
		setQuery,
		setAiMode,
		recentSearches,
	} = useSearchContext()
	const navigate = useNavigate()
	const { currentWorkspace } = useApplicationContext()
	const workspaceId = currentWorkspace?.id
	const { project_id } = useParams()
	const [_, setSortColumn] = useQueryParam(SORT_COLUMN, StringParam)
	const [__, setSortDirection] = useQueryParam(SORT_DIRECTION, StringParam)
	const inputRef = useRef<HTMLTextAreaElement | null>(null)
	const [keys, setKeys] = useState<Keys | undefined>()
	const [values, setValues] = useState<string[] | undefined>()
	const [showErrors, setShowErrors] = useState(false)
	const hasErrors = tokenGroups.some((group) =>
		group.tokens.some((token) => (token as any).errorMessage !== undefined),
	)
	const comboboxStore = useComboboxStore({
		defaultValue: query ?? '',
	})
	const [getKeys, { loading: keysLoading }] = useGetKeysLazyQuery()
	const [getKeyValues, { loading: valuesLoading }] =
		useGetKeyValuesLazyQuery()
	const [cursorIndex, setCursorIndex] = useState(query.length)
	const [isPending, startTransition] = React.useTransition()

	const activePart = getActivePart(cursorIndex, queryParts)

	useEffect(() => {
		// necessary to update the combobox with the URL state
		setQuery(initialQuery.trim() === '' ? '' : initialQuery)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialQuery])

	useEffect(() => {
		if (showErrors && !hasErrors) {
			setShowErrors(false)
		}
	}, [hasErrors, setShowErrors, showErrors])

	const showValues =
		// TODO: code smell, user is not able to use "message" as a search key
		// because we are reserving it for the body implicitly
		activePart.key !== BODY_KEY &&
		activePart.text
			.replace(/\s+/g, '')
			.startsWith(`${activePart.key}${activePart.operator}`)
	const loading = showValues ? valuesLoading : keysLoading
	const showValueSelect =
		activePart.text.replace(/\s+/g, '') ===
			`${activePart.key}${activePart.operator}` ||
		!!activePart.value?.length

	let visibleItems: SearchResult[] = showValues
		? getVisibleValues(
				activePart,
				(defaultValueOptions ?? []).concat(values ?? []),
			)
		: getVisibleKeys(query, activePart, keys)

	// Show operators when we have an exact match for a key
	const keyMatch = visibleItems.find((item) => item.name === activePart.text)
	const showOperators = !!keyMatch

	const visibleRecentSearch = recentSearches.filter((history) => {
		return history.query.indexOf(query) > -1
	})

	if (showOperators) {
		let operators = [] as string[]
		switch (keyMatch.type) {
			case 'Numeric':
				operators = [
					...BOOLEAN_OPERATORS,
					...NUMERIC_OPERATORS,
					...EXISTS_OPERATORS,
				]
				break
			case 'String':
				operators = [
					...BOOLEAN_OPERATORS,
					...EXISTS_OPERATORS,
					...CONTAINS_OPERATOR,
					...MATCHES_OPERATOR,
				]
				break
			case 'Boolean':
				operators = [...BOOLEAN_OPERATORS]
				break
			case 'Creatable':
				operators = [...EQUAL_OPERATOR]
		}

		visibleItems = operators.map(
			(operator) =>
				({
					name: operator,
					type: 'Operator',
				}) as SearchResult,
		)
	}

	// Limit number of items shown.
	visibleItems.length = Math.min(MAX_ITEMS, visibleItems.length)

	const showResults = loading || visibleItems.length > 0 || showValueSelect
	const isDirty = query !== ''

	const submitQuery = (query: string) => {
		onSubmit(query)
	}

	const handleSetCursorIndex = () => {
		if (!isPending) {
			setCursorIndex(inputRef.current?.selectionStart ?? query.length)
		}
	}

	const debouncedGetKeysRef =
		React.useRef<ReturnType<typeof debounce<typeof getKeys>>>(undefined)
	if (!debouncedGetKeysRef.current) {
		debouncedGetKeysRef.current = debounce(getKeys, 300, { leading: true })
	}

	const debouncedGetKeyValuesRef =
		React.useRef<ReturnType<typeof debounce<typeof getKeyValues>>>(
			undefined,
		)
	if (!debouncedGetKeyValuesRef.current) {
		debouncedGetKeyValuesRef.current = debounce(getKeyValues, 300, {
			leading: true,
		})
	}

	useEffect(() => {
		if (showValues || !debouncedGetKeysRef.current) {
			return
		}

		debouncedGetKeysRef.current({
			variables: {
				product_type: productType,
				project_id: project_id!,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: activePart.value,
				event: event,
			},
			fetchPolicy: 'cache-first',
			onCompleted: (data) => {
				setKeys(data.keys)
			},
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activePart.value, showValues, startDate, endDate, productType, event])

	useEffect(() => {
		if (!showValues || !debouncedGetKeyValuesRef.current) {
			return
		}

		const creatableType = creatables?.[activePart.key]
		if (!!creatableType) {
			setValues([creatableType.label])
			return
		}

		debouncedGetKeyValuesRef.current({
			variables: {
				product_type: productType,
				project_id: project_id!,
				key_name: activePart.key,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: activePart.value,
				count: 25,
				event,
			},
			fetchPolicy: 'cache-first',
			onCompleted: (data) => {
				setValues(data.key_values)
			},
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		activePart.value,
		activePart.key,
		showValues,
		startDate,
		endDate,
		productType,
		event,
	])

	useEffect(() => {
		// Ensure the cursor is placed in the correct position after updating the
		// query from selecting a dropdown item.
		inputRef.current?.setSelectionRange(cursorIndex, cursorIndex)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query])

	const comboboxItems = comboboxStore.useState('items')
	const comboboxOpen = comboboxStore.useState('open')

	useEffect(() => {
		if (!comboboxOpen) {
			return
		}

		const { activeId } = comboboxStore.getState()
		const activeElement =
			activeId && comboboxItems.find((i) => i.id === activeId)
		if (activeElement) {
			return
		}

		// Give preference to the first item with a value
		const firstItem =
			comboboxItems.find((i) => !!i.value) ?? comboboxItems[0]
		if (firstItem) {
			comboboxStore.setActiveId(firstItem.id)
			comboboxStore.setState('moves', 0)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comboboxItems, comboboxOpen, query])

	useEffect(() => {
		if (!showValues) {
			setValues(undefined)
		}
	}, [showValues])

	const handleItemSelect = (
		item: SearchResult,
		selectNewItem: boolean = false,
	) => {
		const isValueSelect = item.type === 'Value'
		const isExists = !!EXISTS_OPERATORS.find((eo) => eo === item.name)
		const originalStop = activePart.stop
		let cursorShift = 0

		if (item.type === 'Operator') {
			const space = isExists ? ' ' : ''

			const isContainsOrMatches = !![
				...CONTAINS_OPERATOR,
				...MATCHES_OPERATOR,
			].find((o) => o === item.name)
			if (isContainsOrMatches) {
				cursorShift = -2
			}

			const key =
				activePart.key === BODY_KEY ? activePart.text : activePart.key

			activePart.operator = item.name
			activePart.text = `${key}${space}${activePart.operator}`
			activePart.stop = activePart.start + activePart.text.length
		} else if (isValueSelect) {
			const beforeOp =
				activePart.text.match(
					`${activePart.key}(\\s*)${activePart.operator}`,
				)?.[1] || ''
			const afterOp =
				activePart.text.match(`${activePart.operator}(\\s*)`)?.[1] || ''

			const creatableType = creatables?.[activePart.key]
			activePart.value = quoteQueryValue(
				creatableType ? creatableType.value : item.name,
			)

			activePart.text = `${activePart.key}${beforeOp}${activePart.operator}${afterOp}${activePart.value}`
			activePart.stop = activePart.start + activePart.text.length
		} else {
			activePart.key = item.name
			activePart.text = item.name
			activePart.value = ''
			activePart.stop = activePart.start + activePart.key.length
		}

		let newQuery =
			query.substring(0, activePart.start) +
			activePart.text +
			query.substring(originalStop + 1)

		let newCursorPosition = activePart.stop + cursorShift

		if (selectNewItem && isValueSelect) {
			newQuery += ' '
			newCursorPosition += 1
		}

		startTransition(() => {
			setQuery(newQuery)

			if ((isValueSelect && !selectNewItem) || isExists) {
				submitQuery(newQuery)
				comboboxStore.setOpen(false)
			}
		})

		setCursorIndex(newCursorPosition)

		comboboxStore.setActiveId(null)
		comboboxStore.setState('moves', 0)
	}

	const handleHistorySelection = (
		newQuery: string,
		selectNewItem: boolean = false,
	) => {
		let newCursorPosition = newQuery.length

		if (selectNewItem) {
			newQuery += ' '
			newCursorPosition += 1
		}

		startTransition(() => {
			submitQuery(newQuery)
			comboboxStore.setOpen(false)
		})

		setCursorIndex(newCursorPosition)
		comboboxStore.setActiveId(null)
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
			position="relative"
		>
			{!hideIcon ? (
				<IconSolidSearch
					className={clsx(styles.searchIcon, {
						[styles.searchIconWithActions]: hasAdditonalActions,
					})}
				/>
			) : null}

			<Box
				display="flex"
				alignItems="flex-start"
				gap="6"
				width="full"
				color="weak"
				position="relative"
				margin="auto"
			>
				<Box
					cssClass={clsx(styles.comboboxTagsContainer, {
						[styles.comboboxTagsContainerDisabled]: disabled,
					})}
					style={{
						left: hideIcon ? 4 : 2,
						paddingLeft: hideIcon ? 2 : 38,
					}}
				>
					{tokenGroups.map((tokenGroup, index) => {
						if (tokenGroup.tokens.length === 0) {
							return null
						}

						return (
							<QueryPart
								key={index}
								typeaheadOpen={comboboxOpen}
								cursorIndex={cursorIndex}
								index={index}
								tokenGroup={tokenGroup}
								showValues={showValues}
								showErrors={showErrors}
								onRemoveItem={handleRemoveItem}
							/>
						)
					})}
				</Box>
				<Combobox
					disabled={disabled}
					store={comboboxStore}
					name="search"
					placeholder={placeholder ?? 'Search...'}
					className={clsx(styles.combobox, {
						[styles.comboboxNotEmpty]: query.length > 0,
					})}
					render={
						// @ts-ignore onPointerEnterCapture, onPointerLeaveCapture ignored by autoresize lib
						<TextareaAutosize
							ref={inputRef}
							style={{ resize: 'none', overflowY: 'hidden' }}
							spellCheck={false}
							autoCorrect="off"
							autoCapitalize="off"
						/>
					}
					value={query}
					onChange={(e) => {
						// Need to update cursor position before updating the query for all
						// cursor-based logic to work.
						handleSetCursorIndex()

						// Need to set this bit of React state to force a re-render of the
						// component. For some reason the combobox value isn't updated until
						// after a delay or blurring the input.
						setQuery(e.target.value)
					}}
					onBlur={() => {
						submitQuery(query)
						handleSetCursorIndex()
						inputRef.current?.blur()

						if (hasErrors && !showErrors) {
							setShowErrors(true)
						}
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

				{isDirty && !disabled && (
					<Box
						position="absolute"
						style={{
							right: 8,
							top: 8,
						}}
					>
						<IconSolidXCircle
							size={16}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()

								setQuery('')
								submitQuery('')
								setSortColumn(undefined)
								setSortDirection(undefined)
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
					fixed
				>
					<Box cssClass={styles.comboboxResults}>
						{aiSupportedSearch && activePart.text === '' && (
							<Combobox.Group
								className={styles.comboboxGroup}
								store={comboboxStore}
							>
								<Combobox.Item
									className={styles.comboboxItem}
									onClick={() =>
										enableAIMode
											? setAiMode(true)
											: navigate(
													`/w/${workspaceId}/harold-ai`,
												)
									}
									store={comboboxStore}
								>
									<Stack
										direction="row"
										gap="4"
										align="center"
									>
										<IconSolidSparkles />
										<Text color="weak" size="small">
											Generate query from plain English
											(Harold AI)
										</Text>
									</Stack>
								</Combobox.Item>
							</Combobox.Group>
						)}
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
									<Box
										py="8"
										cssClass={{
											display: 'inline-block',
										}}
									>
										<Text
											size="small"
											family="monospace"
											color="secondaryContentText"
											display="inline-block"
											break="all"
										>
											<Text
												color="weak"
												size="small"
												display="inline-block"
											>
												Show all results for &nbsp;
											</Text>
											&lsquo;
											{activePart.key === BODY_KEY
												? activePart.value
												: activePart.text}
											&rsquo;
										</Text>
									</Box>
								</Combobox.Item>
							</Combobox.Group>
						)}
						{!showValues &&
							!showOperators &&
							visibleRecentSearch.length > 0 && (
								<Combobox.Group
									className={styles.comboboxGroup}
									store={comboboxStore}
								>
									<Combobox.GroupLabel store={comboboxStore}>
										<Box px="10" py="6">
											<Text
												color="moderate"
												size="xxSmall"
											>
												Recent
											</Text>
										</Box>
									</Combobox.GroupLabel>

									{visibleRecentSearch.map(
										(data: SearchEntry, index: number) => {
											return (
												<Combobox.Item
													className={
														styles.comboboxItem
													}
													key={index}
													onClick={(e) => {
														handleHistorySelection(
															data.query,
															e.metaKey ||
																e.ctrlKey,
														)
													}}
													store={comboboxStore}
													value={data.query}
													hideOnClick={false}
													setValueOnClick={false}
													title={data.title}
												>
													<Text
														color="secondaryContentText"
														lines="1"
														family="monospace"
													>
														{data.query}
													</Text>
													<Badge label="History" />
												</Combobox.Item>
											)
										},
									)}
								</Combobox.Group>
							)}
						{loading && (
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
											onClick={(e) => {
												handleItemSelect(
													key,
													e.metaKey || e.ctrlKey,
												)
											}}
											store={comboboxStore}
											value={key.name}
											hideOnClick={false}
											setValueOnClick={false}
											title={key.name}
										>
											<Text
												color="secondaryContentText"
												lines="1"
												family="monospace"
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
						<Box display="flex" flexDirection="row" gap="16">
							<Box
								display="inline-flex"
								flexDirection="row"
								alignItems="center"
								gap="4"
							>
								<Badge
									variant="gray"
									size="small"
									iconStart={<IconSolidSwitchVertical />}
								/>
								<Text color="weak" size="xSmall">
									Navigate
								</Text>
							</Box>
							<Box
								display="inline-flex"
								flexDirection="row"
								alignItems="center"
								gap="4"
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
							{showValues && (
								<Box
									display="inline-flex"
									flexDirection="row"
									alignItems="center"
									gap="4"
								>
									<Badge
										variant="gray"
										size="small"
										label={
											/mac/i.test(navigator.userAgent)
												? '⌘+Enter'
												: 'Ctrl+Enter'
										}
									/>
									<Text color="weak" size="xSmall">
										Select+New
									</Text>
								</Box>
							)}
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

const getVisibleKeys = (
	queryText: string,
	activeQueryPart?: SearchExpression,
	keys?: Keys,
) => {
	const startingNewPart = queryText.length === 0 || queryText.endsWith(' ')

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
	const activePart = (activeQueryPart?.value ?? '').trim()
	const filteredValues =
		values?.filter(
			(v) =>
				// Don't filter if no value has been typed
				!activePart.length ||
				// Return values that match the query part
				v.toLowerCase().includes(activePart.toLowerCase()),
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
			case '="**"':
				return 'contains'
			case '!="**"':
				return 'does not contain'
			case '="//"':
				return 'matches'
			case '!="//"':
				return 'does not match'
		}
	} else if (key.type === 'Value') {
		return undefined
	} else {
		return key.type?.toLowerCase()
	}
}
