import { useGetLogsKeysQuery, useGetLogsKeyValuesLazyQuery } from '@graph/hooks'
import { GetLogsKeysQuery } from '@graph/operations'
import {
	Badge,
	Box,
	Combobox,
	Form,
	IconSolidSearch,
	IconSolidSwitchVertical,
	Preset,
	PreviousDateRangePicker,
	Stack,
	Text,
	useComboboxState,
	useForm,
	useFormState,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { FORMAT } from '@pages/LogsPage/constants'
import {
	BODY_KEY,
	LogsSearchParam,
	parseLogsQuery,
	stringifyLogsQuery,
} from '@pages/LogsPage/SearchForm/utils'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
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
	initialQuery,
	startDate,
	endDate,
	onDatesChange,
	onFormSubmit,
	presets,
	minDate,
}: Props) => {
	const [selectedDates, setSelectedDates] = useState([startDate, endDate])

	const { projectId } = useProjectId()
	const formState = useFormState({ defaultValues: { query: initialQuery } })

	useEffect(() => {
		if (!startDate || !endDate) return
		if (
			selectedDates[0].getTime() === startDate.getTime() &&
			selectedDates[1].getTime() === endDate.getTime()
		) {
			return
		}
		setSelectedDates([startDate, endDate])
	}, [startDate, endDate, selectedDates])

	const { data: keysData } = useGetLogsKeysQuery({
		variables: {
			project_id: projectId,
		},
	})

	formState.useSubmit(() => onFormSubmit(formState.values.query))

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
					keys={keysData?.logs_keys}
					startDate={startDate}
					endDate={endDate}
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
		</Form>
	)
}

export { SearchForm }

const Search: React.FC<{
	keys?: GetLogsKeysQuery['logs_keys']
	startDate: Date
	endDate: Date
}> = ({ keys, startDate, endDate }) => {
	const formState = useForm()
	const { query } = formState.values
	const { project_id } = useParams()
	const containerRef = useRef<HTMLDivElement | null>(null)
	const inputRef = useRef<HTMLInputElement | null>(null)
	const state = useComboboxState({ gutter: 6, sameWidth: true })
	const [getLogsKeyValues, { data, loading: valuesLoading }] =
		useGetLogsKeyValuesLazyQuery()

	const queryTerms = parseLogsQuery(query)
	const cursorIndex = inputRef.current?.selectionStart || 0
	const activeTermIndex = getActiveTermIndex(cursorIndex, queryTerms)
	const activeTerm = queryTerms[activeTermIndex]
	const showValues =
		activeTerm.key !== BODY_KEY ||
		!!keys?.find((k) => k.name === activeTerm.key)
	const loading = keys?.length === 0 || (showValues && valuesLoading)
	const showTermSelect = !!activeTerm.value.length

	const visibleItems = showValues
		? getVisibleValues(activeTerm, data?.logs_key_values)
		: getVisibleKeys(query, queryTerms, activeTerm, keys)

	// Limit number of items shown
	visibleItems.length = Math.min(MAX_ITEMS, visibleItems.length)

	const showResults = loading || visibleItems.length > 0 || showTermSelect

	useEffect(() => {
		if (!showValues) {
			return
		}

		getLogsKeyValues({
			variables: {
				project_id: project_id!,
				key_name: activeTerm.key,
				date_range: {
					start_date: moment(startDate).format(FORMAT),
					end_date: moment(endDate).format(FORMAT),
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

	const handleItemSelect = (
		key: GetLogsKeysQuery['logs_keys'][0] | string,
	) => {
		const isValueSelect = typeof key === 'string'

		// If string, it's a value not a key
		if (isValueSelect) {
			queryTerms[activeTermIndex].value = key
		} else {
			queryTerms[activeTermIndex].key = key.name
			queryTerms[activeTermIndex].value = ''
		}

		formState.setValue('query', stringifyLogsQuery(queryTerms))

		if (isValueSelect) {
			state.setOpen(false)
			formState.submit()
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
			<IconSolidSearch className={styles.searchIcon} />

			<Combobox
				ref={inputRef}
				state={state}
				name="search"
				placeholder="Search your logs..."
				value={query}
				onChange={(e) => {
					const value = e.target.value
					formState.setValue('query', value)
				}}
				className={styles.combobox}
				setValueOnChange={false}
				onBlur={() => {
					formState.submit()
				}}
			/>

			{showResults && (
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
								{activeTerm.value && (
									<Combobox.Item
										className={styles.comboboxItem}
										onClick={() =>
											handleItemSelect(activeTerm.value)
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
