import { GetLogsKeysQuery, GetTracesKeysQuery } from '@graph/operations'
import {
	Badge,
	Box,
	Combobox,
	defaultPresets,
	getNow,
	IconSolidExclamationCircle,
	IconSolidExternalLink,
	IconSolidPlus,
	IconSolidSearch,
	IconSolidSwitchVertical,
	IconSolidXCircle,
	Preset,
	PreviousDateRangePicker,
	Stack,
	Text,
	Tooltip,
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
import SearchGrammarLexer from '@/components/Search/Parser/antlr/SearchGrammarLexer'
import SearchGrammarParser from '@/components/Search/Parser/antlr/SearchGrammarParser'
import { SearchExpression } from '@/components/Search/Parser/listener'
import {
	TIME_FORMAT,
	TIME_MODE,
} from '@/components/Search/SearchForm/constants'
import {
	BODY_KEY,
	DEFAULT_OPERATOR,
	stringifySearchQuery,
} from '@/components/Search/SearchForm/utils'
import { parseSearch, SearchToken } from '@/components/Search/utils'
import {
	useGetLogsKeysLazyQuery,
	useGetLogsKeyValuesLazyQuery,
	useGetTracesKeysLazyQuery,
	useGetTracesKeyValuesLazyQuery,
} from '@/graph/generated/hooks'
import { KeyType } from '@/graph/generated/schemas'

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
	onDatesChange: (startDate: Date, endDate: Date) => void
	presets: Preset[]
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
}

const SearchForm: React.FC<SearchFormProps> = ({
	initialQuery,
	startDate,
	endDate,
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
}) => {
	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const [query, setQuery] = React.useState(initialQuery)

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
	const activePartIndex = getActivePartIndex(cursorIndex, queryParts)
	const activePart = queryParts[activePartIndex] ?? {}
	const debouncedKeyValue = useDebouncedValue<string>(activePart.value)

	// TODO: code smell, user is not able to use "message" as a search key
	// because we are reserving it for the body implicitly
	const showValues =
		activePart.key !== BODY_KEY &&
		!!keysData?.keys?.find((k) => k.name === activePart.key)
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
		const part = queryParts[activePartIndex]
		const isValueSelect = typeof key === 'string'
		const value = isValueSelect ? key : key.name
		const isLastPart = activePartIndex === queryParts.length - 1

		if (isValueSelect) {
			part.value = value
			part.text = `${part.key}${part.operator}${value}`
		} else {
			debugger
			part.key = value
			part.operator = DEFAULT_OPERATOR
			part.text = `${value}${DEFAULT_OPERATOR}`
			part.value = ''
		}

		const newCursorPosition =
			part.start +
			part.key.length +
			part.operator.length +
			part.value.length

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
			}, 0)
		}
	}

	const handleRemoveItem = (index: number) => {
		const newTokenGroups = [...tokenGroups]
		newTokenGroups.splice(index, 1)
		const newQuery = newTokenGroups
			.map((tokenGroup) => tokenGroup.tokens.map((token) => token.text))
			.join('')
			.trim()

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
							{activePart.value && (
								<Combobox.Item
									className={styles.comboboxItem}
									onClick={() =>
										handleItemSelect(
											showValues
												? activePart.value
												: {
														name: activePart.value,
														type: KeyType.String,
														__typename: 'QueryKey',
												  },
										)
									}
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

const QueryPart: React.FC<{
	cursorIndex: number
	index: number
	tokenGroup: TokenGroup
	onRemoveItem: (index: number) => void
}> = ({ cursorIndex, index, tokenGroup, onRemoveItem }) => {
	const active =
		cursorIndex >= tokenGroup.start && cursorIndex <= tokenGroup.stop + 1
	const errorToken = tokenGroup.tokens.find(
		(token) => (token as any).errorMessage !== undefined,
	)
	const error = (errorToken as any)?.errorMessage

	if (tokenGroup.type !== 'expression') {
		return (
			<>
				{tokenGroup.tokens.map((token, index) => {
					const { text } = token
					const key = `${text}-${index}`

					return <Token key={key} text={text} />
				})}
			</>
		)
	}

	return (
		<>
			<Tooltip
				placement="bottom"
				open={!!active}
				disabled={!error}
				trigger={
					<Box
						cssClass={clsx(styles.comboboxTag, {
							[styles.comboboxTagActive]: active,
							[styles.comboboxTagError]: !!error,
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

						{error && (
							<IconSolidExclamationCircle
								className={styles.comboboxTagErrorIndicator}
								size={13}
							/>
						)}

						{tokenGroup.tokens.map((token, index) => {
							const { text } = token
							const key = `${text}-${index}`

							return <Token key={key} text={text} />
						})}

						<Box cssClass={styles.comboboxTagBackground} />
					</Box>
				}
			>
				{error ? <ErrorRenderer error={error} /> : null}
			</Tooltip>
		</>
	)
}

const Token = ({ text }: { text: string; error?: string }): JSX.Element => {
	if (SEPARATORS.includes(text)) {
		return <Box style={{ color: '#E93D82', zIndex: 1 }}>{text}</Box>
	} else {
		return <Box style={{ zIndex: 1 }}>{text}</Box>
	}
}

const getActivePartIndex = (
	cursorIndex: number,
	queryParts: SearchExpression[],
): number => {
	let activePartIndex

	queryParts.find((param, index) => {
		if (param.stop < cursorIndex - 1) {
			return false
		}

		activePartIndex = index
		return true
	})

	return activePartIndex === undefined
		? queryParts.length - 1
		: activePartIndex
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

type TokenGroup = {
	tokens: SearchToken[]
	start: number
	stop: number
	type: 'expression' | 'separator'
	expression?: SearchExpression
}

const SEPARATOR_TOKENS = [SearchGrammarLexer.AND, SearchGrammarLexer.OR]

const buildTokenGroups = (
	tokens: SearchToken[],
	queryParts: SearchExpression[],
	queryString: string,
) => {
	const tokenGroups: TokenGroup[] = [
		{ tokens: [], start: 0, stop: 0, type: 'separator' },
	]
	let currentGroupIndex = 0
	let currentTokenIndex = 0
	let currentToken = tokens[currentTokenIndex]
	let lastStopIndex = -1

	while (currentToken) {
		const numExpressions = tokenGroups.filter(
			(tokenGroup) => tokenGroup.type === 'expression',
		).length
		const currentPartIndex = queryParts.findIndex(
			(part) =>
				currentToken.start >= part.start &&
				currentToken.stop <= part.stop,
		)
		const currentPart = queryParts[currentPartIndex]
		const whitespace = queryString.substring(
			lastStopIndex + 1,
			currentToken.start,
		)
		const whitespaceToken =
			whitespace.length > 0
				? {
						type: SearchGrammarLexer.WS,
						text: whitespace,
						start: lastStopIndex + 1,
						stop: currentToken.start,
				  }
				: undefined

		if (
			(currentToken.start === currentPart?.start ||
				currentToken.stop > lastStopIndex) &&
			numExpressions <= queryParts.length
		) {
			if (whitespaceToken) {
				currentGroupIndex++
				tokenGroups[currentGroupIndex] = {
					tokens: [whitespaceToken],
					start: whitespaceToken.start,
					stop: whitespaceToken.stop,
					type: 'separator',
				}
			}

			currentGroupIndex++
			tokenGroups[currentGroupIndex] = {
				tokens: [],
				start: currentToken.start,
				stop: currentToken.stop,
				type: 'separator',
			}
		} else {
			if (whitespaceToken) {
				tokenGroups[currentGroupIndex].tokens.push(whitespaceToken)
			}
		}

		// Ignore EOF token
		if (currentToken.type !== SearchGrammarLexer.EOF) {
			tokenGroups[currentGroupIndex].tokens.push(currentToken)
			tokenGroups[currentGroupIndex].stop = currentToken.stop

			const isExpression = !SEPARATOR_TOKENS.includes(currentToken.type)
			if (isExpression) {
				tokenGroups[currentGroupIndex].type = 'expression'
				tokenGroups[currentGroupIndex].expression = currentPart
			}
		}

		lastStopIndex = currentToken.stop
		currentTokenIndex++
		currentToken = tokens[currentTokenIndex]
	}

	return tokenGroups
}

const ErrorRenderer: React.FC<{ error: string }> = ({ error }) => {
	if (error.endsWith("expecting ')'") || error.startsWith("missing ')'")) {
		error = 'Missing closing parenthesis'
	} else if (error.startsWith("mismatched input '\"'")) {
		error = 'Missing closing quote'
	}

	return (
		<Box p="4">
			<Text>{error}</Text>
		</Box>
	)
}
