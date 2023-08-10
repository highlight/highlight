import { useGetLogsKeysQuery, useGetLogsKeyValuesLazyQuery } from '@graph/hooks'
import { GetLogsKeysQuery } from '@graph/operations'
import {
	Badge,
	Box,
	Combobox,
	Form,
	IconSolidExternalLink,
	IconSolidPlus,
	IconSolidSearch,
	IconSolidSwitchVertical,
	IconSolidXCircle,
	Preset,
	PreviousDateRangePicker,
	Stack,
	Text,
	useComboboxState,
	useForm,
	useFormState,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { LOG_TIME_FORMAT, TIME_MODE } from '@pages/LogsPage/constants'
import {
	BODY_KEY,
	LogsSearchParam,
	parseLogsQuery,
	quoteQueryValue,
	stringifyLogsQuery,
} from '@pages/LogsPage/SearchForm/utils'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import { stringify } from 'query-string'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DateTimeParam, encodeQueryParams, StringParam } from 'use-query-params'

import { Button } from '@/components/Button'

import * as styles from './SearchForm.css'

type Props = {
	onFormSubmit: (query: string) => void
	initialQuery: string
	startDate: Date
	endDate: Date
	onDatesChange: (startDate: Date, endDate: Date) => void
	presets: Preset[]
	minDate: Date
	timeMode: TIME_MODE
	disableSearch?: boolean
	addLinkToViewInLogViewer?: boolean
	hideDatePicker?: boolean
	hideCreateAlert?: boolean
}

const MAX_ITEMS = 10

const SearchForm = ({
	initialQuery,
	startDate,
	endDate,
	onDatesChange,
	onFormSubmit,
	presets,
	minDate,
	timeMode,
	disableSearch,
	addLinkToViewInLogViewer,
	hideDatePicker,
	hideCreateAlert,
}: Props) => {
	const navigate = useNavigate()
	const [selectedDates, setSelectedDates] = useState([startDate, endDate])
	const formState = useFormState({ defaultValues: { query: initialQuery } })
	const { projectId } = useProjectId()
	const { data: keysData, loading: keysLoading } = useGetLogsKeysQuery({
		variables: {
			project_id: projectId,
			date_range: {
				start_date: moment(startDate).format(LOG_TIME_FORMAT),
				end_date: moment(endDate).format(LOG_TIME_FORMAT),
			},
		},
	})

	formState.useSubmit(() => {
		onFormSubmit(formState.values.query)
	})

	const handleDatesChange = (dates: Date[]) => {
		setSelectedDates(dates)

		if (dates.length == 2) {
			onDatesChange(dates[0], dates[1])
		}
	}

	return (
		<Form
			resetOnSubmit={false}
			style={{ position: 'relative' }}
			state={formState}
		>
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
					keys={keysData?.logs_keys}
					keysLoading={keysLoading}
					disableSearch={disableSearch}
				/>
				<Box display="flex" pr="8" py="6" gap="6">
					{addLinkToViewInLogViewer && (
						<Button
							kind="secondary"
							trackingId="view-in-log-viewer"
							onClick={() => {
								const encodedQuery = encodeQueryParams(
									{
										query: StringParam,
										start_date: DateTimeParam,
										end_date: DateTimeParam,
									},
									{
										query: formState.values.query,
										start_date: startDate,
										end_date: endDate,
									},
								)
								navigate({
									pathname: `/${projectId}/logs`,
									search: stringify(encodedQuery),
								})
							}}
							emphasis="medium"
							iconLeft={<IconSolidExternalLink />}
						>
							View in log viewer
						</Button>
					)}
					{!hideDatePicker && (
						<PreviousDateRangePicker
							emphasis="low"
							selectedDates={selectedDates}
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
										query: formState.values.query,
										start_date: startDate,
										end_date: endDate,
									},
								)
								navigate({
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
		</Form>
	)
}

export { SearchForm }

export const Search: React.FC<{
	initialQuery: string
	startDate: Date
	endDate: Date
	keys?: GetLogsKeysQuery['logs_keys']
	hideIcon?: boolean
	className?: string
	keysLoading: boolean
	disableSearch?: boolean
	placeholder?: string
}> = ({
	initialQuery,
	startDate,
	endDate,
	hideIcon,
	className,
	keys,
	keysLoading,
	disableSearch,
	placeholder,
}) => {
	const formState = useForm()
	const { project_id } = useParams()
	const containerRef = useRef<HTMLDivElement | null>(null)
	const inputRef = useRef<HTMLInputElement | null>(null)
	const state = useComboboxState({
		gutter: 10,
		sameWidth: true,
		defaultValue: initialQuery ?? '',
	})
	const [getLogsKeyValues, { data, loading: valuesLoading }] =
		useGetLogsKeyValuesLazyQuery()

	const queryTerms = parseLogsQuery(state.value)
	const cursorIndex = inputRef.current?.selectionStart || 0
	const activeTermIndex = getActiveTermIndex(cursorIndex, queryTerms)
	const activeTerm = queryTerms[activeTermIndex]

	const showValues =
		activeTerm.key !== BODY_KEY ||
		!!keys?.find((k) => k.name === activeTerm.key)
	const loading = showValues ? valuesLoading : keysLoading
	const showTermSelect = !!activeTerm.value.length

	const visibleItems = showValues
		? getVisibleValues(activeTerm, data?.logs_key_values)
		: getVisibleKeys(state.value, queryTerms, activeTerm, keys)

	// Limit number of items shown
	visibleItems.length = Math.min(MAX_ITEMS, visibleItems.length)

	const showResults = loading || visibleItems.length > 0 || showTermSelect
	const isDirty = state.value !== ''

	const submitQuery = (query: string) => {
		formState.setValue('query', query)
		formState.submit()
	}

	useEffect(() => {
		if (!showValues) {
			return
		}

		getLogsKeyValues({
			variables: {
				project_id: project_id!,
				key_name: activeTerm.key,
				date_range: {
					start_date: moment(startDate).format(LOG_TIME_FORMAT),
					end_date: moment(endDate).format(LOG_TIME_FORMAT),
				},
			},
		})
	}, [
		activeTerm.key,
		endDate,
		getLogsKeyValues,
		project_id,
		showValues,
		startDate,
	])

	useEffect(() => {
		// necessary to update the combobox with the URL state
		state.setValue(initialQuery.trim())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialQuery])

	useEffect(() => {
		// links combobox and form states;
		// necessary to update the URL when the query changes
		formState.setValue('query', state.value)

		// Clear the selected item if the combobox is empty. Need to flush execution
		// queue before clearing the active item.
		if (state.value === '') {
			setTimeout(() => {
				state.setActiveId(null)
				state.setMoves(0)
			}, 0)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.value])

	const handleItemSelect = (
		key: GetLogsKeysQuery['logs_keys'][0] | string,
		noQuotes?: boolean,
	) => {
		const isValueSelect = typeof key === 'string'

		// If string, it's a value not a key
		if (isValueSelect) {
			queryTerms[activeTermIndex].value = noQuotes
				? key
				: quoteQueryValue(key)
		} else {
			queryTerms[activeTermIndex].key = key.name
			queryTerms[activeTermIndex].value = ''
		}

		const newQuery = stringifyLogsQuery(queryTerms)
		state.setValue(newQuery)

		if (isValueSelect) {
			submitQuery(newQuery)
			state.setOpen(false)
		}

		state.setActiveId(null)
		state.setMoves(0)
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
			>
				<Combobox
					ref={inputRef}
					disabled={disableSearch}
					autoSelect
					state={state}
					name="search"
					placeholder={placeholder ?? 'Search your logs...'}
					className={className ?? styles.combobox}
					style={{
						paddingLeft: hideIcon ? undefined : 40,
					}}
					onBlur={() => {
						submitQuery(state.value)
						formState.setValue('query', state.value)
						inputRef?.current?.blur()
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && state.value === '') {
							e.preventDefault()
							submitQuery(state.value)
							state.setOpen(false)
						}
					}}
				/>

				{isDirty && !disableSearch && (
					<IconSolidXCircle
						size={16}
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()

							state.setValue('')
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
					state={state}
				>
					<Box pt="4">
						<Combobox.GroupLabel state={state}>
							{activeTerm.value && (
								<Combobox.Item
									className={styles.comboboxItem}
									onClick={() =>
										handleItemSelect(activeTerm.value, true)
									}
									state={state}
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
						state={state}
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
	queryTerms: LogsSearchParam[],
	activeQueryTerm: LogsSearchParam,
	keys?: GetLogsKeysQuery['logs_keys'],
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

const getVisibleValues = (
	activeQueryTerm: LogsSearchParam,
	values?: string[],
) => {
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
