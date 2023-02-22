import { useGetLogsKeysQuery, useGetLogsKeyValuesLazyQuery } from '@graph/hooks'
import { GetLogsKeysQuery } from '@graph/operations'
import {
	Badge,
	Box,
	Combobox,
	Form,
	IconSolidArrowsExpand,
	IconSolidSearch,
	Preset,
	PreviousDateRangePicker,
	Stack,
	Text,
	useComboboxState,
	useForm,
	useFormState,
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
	const [selectedDates, setSelectedDates] = useState([startDate, endDate])
	const { project_id } = useParams()
	const formState = useFormState({ defaultValues: { query: initialQuery } })

	const { data: keysData } = useGetLogsKeysQuery({
		variables: {
			project_id: project_id!,
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
				<Search keys={keysData?.logs_keys} />
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
}> = ({ keys }) => {
	const formState = useForm()
	const { query } = formState.values
	const { project_id } = useParams()
	const containerRef = useRef<HTMLDivElement | null>(null)
	const inputRef = useRef<HTMLInputElement | null>(null)
	const state = useComboboxState({ gutter: 6, sameWidth: true })
	const [getLogsKeyValues, { data, loading: valuesLoading }] =
		useGetLogsKeyValuesLazyQuery()
	const loading = keys?.length === 0 || valuesLoading

	const queryTerms = parseLogsQuery(query)
	const cursorIndex = inputRef.current?.selectionStart || 0
	const activeTermIndex = getActiveTermIndex(cursorIndex, queryTerms)
	const activeTerm = queryTerms[activeTermIndex]

	const showValues =
		activeTerm.key !== 'text' ||
		!!keys?.find((k) => k.name === activeTerm.key)

	const activeTermKeys = queryTerms.map((term) => term.key)
	keys = keys?.filter((key) => activeTermKeys.indexOf(key.name) === -1)

	const visibleItems = showValues
		? getVisibleValues(activeTerm, data?.logs_key_values)
		: getVisibleKeys(query, activeTerm, keys)

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
	}, [activeTerm.key, getLogsKeyValues, project_id, showValues])

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
				autoSelect
				ref={inputRef}
				state={state}
				name="search"
				placeholder="Search your logs..."
				value={query}
				onChange={(e) => {
					formState.setValue('query', e.target.value)
					state.setOpen(true)

					if (state.items.length) {
						state.setActiveId(state.items[0].id)
					}
				}}
				className={styles.combobox}
				setValueOnChange={false}
				onBlur={formState.submit}
			/>

			{(loading || visibleItems.length > 0) && (
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
	const filteredValues =
		values?.filter(
			(v) => !activeTerm.value.length || v.indexOf(activeTerm.value) > -1,
		) || []

	if (values?.indexOf(activeTerm.value) === -1) {
		filteredValues.unshift(activeTerm.value)
	}

	return filteredValues
}
