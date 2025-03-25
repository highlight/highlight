import React, { useEffect, useMemo } from 'react'
import {
	Box,
	Callout,
	ComboboxSelect,
	IconSolidDotsHorizontal,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import useLocalStorage from '@rehooks/local-storage'
import moment from 'moment'

import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import LoadingBox from '@/components/LoadingBox'
import { SearchExpression } from '@/components/Search/Parser/listener'
import { useSearchContext } from '@/components/Search/SearchContext'
import { BODY_KEY } from '@/components/Search/SearchForm/utils'
import { parseSearch } from '@/components/Search/utils'
import {
	useGetKeysLazyQuery,
	useGetKeyValueSuggestionsQuery,
} from '@/graph/generated/hooks'
import { ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'

import { Filter } from './Filter'
import { STANDARD_FILTERS, FilterInfo } from './constants'
import { addKey, addValueToKey, addFilter, removeFilter } from './utils'
import * as style from './styles.css'

type Props = {
	product: ProductType
	startDate: Date
	endDate: Date
	displayLeftPanel: boolean
}

export const LeftPanel: React.FC<Props> = ({
	displayLeftPanel,
	product,
	startDate,
	endDate,
}) => {
	if (!displayLeftPanel) {
		return null
	}

	return (
		<Box
			borderRight="dividerWeak"
			height="full"
			py="4"
			px="8"
			style={{ width: 250 }}
			display="flex"
			flexShrink={0}
			flexGrow={0}
			overflowY="auto"
			overflowX="hidden"
			hiddenScroll
		>
			<InnerPanel
				product={product}
				startDate={startDate}
				endDate={endDate}
			/>
		</Box>
	)
}

type InnerPanelProps = {
	product: ProductType
	startDate: Date
	endDate: Date
}

const InnerPanel: React.FC<InnerPanelProps> = ({
	product,
	startDate,
	endDate,
}) => {
	const { projectId } = useProjectId()
	const { initialQuery: searchedQuery, query, onSubmit } = useSearchContext()
	const [loading, setLoading] = React.useState(true)

	const [filterKeys, setFilterKeys] = useLocalStorage(
		`highlight-${product}-left-panel-keys`,
		STANDARD_FILTERS[product],
	)

	const { data, error } = useGetKeyValueSuggestionsQuery({
		variables: {
			product_type: product,
			project_id: projectId,
			date_range: {
				start_date: startDate.toISOString(),
				end_date: endDate.toISOString(),
			},
			keys: filterKeys || STANDARD_FILTERS[product],
		},
		onCompleted: () => setLoading(false),
	})

	const queryParts = useMemo(() => {
		return parseSearch(searchedQuery).queryParts
	}, [searchedQuery])

	const filters = useMemo(() => {
		const filtersMap: Map<string, FilterInfo> = new Map()

		// add filter suggestions
		data?.key_values_suggestions?.forEach((suggestion) => {
			addKey(filtersMap, suggestion.key)

			suggestion.values.forEach((value) => {
				addValueToKey(filtersMap, suggestion.key, value.value, false)
			})
		})

		// add selected filters
		queryParts.forEach((part) => {
			if (part.operator !== '=' || part.key === BODY_KEY) {
				return
			}

			const value = part.value.trim()

			if (value.startsWith('(') && value.endsWith(')')) {
				const values = value.slice(1, -1).split(/\s+or\s+/i)

				values.forEach((v) => {
					const addedValue = v.replace(/^"(.*)"$/, '$1')
					addValueToKey(filtersMap, part.key, addedValue, true)
				})
			} else {
				const addedValue = value.replace(/^"(.*)"$/, '$1')
				addValueToKey(filtersMap, part.key, addedValue, true)
			}
		})

		const allFilters: {
			key: string
			saved: boolean
			values: { value: string; selected: boolean }[]
		}[] = []

		filtersMap.forEach((filterInfo, key) => {
			allFilters.push({
				key,
				saved: filterInfo.saved,
				values: Array.from(filterInfo.values).map(
					([value, selected]) => ({
						value,
						selected,
					}),
				),
			})
		})

		return allFilters
	}, [data?.key_values_suggestions, queryParts])

	const onSelect = (key: string, value: string, add: boolean) => {
		let keyExists = false
		const newQueryParts = queryParts.reduce((acc, part) => {
			if (part.key !== key || part.operator !== '=') {
				acc.push(part)
				return acc
			}

			const newPart = { ...part }
			keyExists = true
			if (add) {
				newPart.text = addFilter(part.text, key, value)
				acc.push(newPart)
			} else {
				newPart.text = removeFilter(part.text, key, value)
				if (newPart.text !== '') {
					acc.push(newPart)
				}
			}

			return acc
		}, [] as SearchExpression[])

		let newQuery = query
		if (!keyExists && add) {
			// add to existing query if no match and add
			newQuery = `${query} ${key}="${value}"`.trim()
		} else if (keyExists) {
			// create new query from updated parts
			newQuery = newQueryParts
				.map((part) => part.text)
				.join(' ')
				.trim()
		}

		onSubmit(newQuery)
	}

	const onRemoveFilter = (key: string) => {
		const newFilterKeys = filterKeys.filter((k) => k !== key)
		setFilterKeys(newFilterKeys)
	}

	const onAddFilter = (key: string) => {
		const newFilterKeys = [...filterKeys, key]
		setFilterKeys(newFilterKeys)
	}

	const onMoveFilterUp = (filterIndex: number) => {
		const swapIndex = filterIndex - 1
		const newFilterKeys = [...filterKeys]
		newFilterKeys[filterIndex] = filterKeys[swapIndex]
		newFilterKeys[swapIndex] = filterKeys[filterIndex]
		setFilterKeys(newFilterKeys)
	}

	const onMoveFilterDown = (filterIndex: number) => {
		const swapIndex = filterIndex + 1
		const newFilterKeys = [...filterKeys]
		newFilterKeys[filterIndex] = filterKeys[swapIndex]
		newFilterKeys[swapIndex] = filterKeys[filterIndex]
		setFilterKeys(newFilterKeys)
	}

	if (loading) {
		return <LoadingBox />
	}

	if (error) {
		return (
			<Box width="full" alignSelf="center" justifySelf="center">
				<Callout title="Failed to load suggestions" kind="error" />
			</Box>
		)
	}

	return (
		<Stack width="full" gap="0">
			<Stack
				p="4"
				direction="row"
				justifyContent="space-between"
				alignItems="center"
			>
				<Text size="large" weight="bold">
					Filters
				</Text>
				<CustomFiltersButton
					product={product}
					startDate={startDate}
					endDate={endDate}
					selectedKeys={filterKeys}
					onChange={setFilterKeys}
				/>
			</Stack>
			{filters.map((filter, index) => {
				const isSaved = filter.saved
				const isFirstSaved = index === 0
				const isLastSaved = index === filterKeys.length - 1

				return (
					<Filter
						key={filter.key}
						product={product}
						startDate={startDate}
						endDate={endDate}
						filter={filter.key}
						values={filter.values}
						onSelect={onSelect}
						onKeyRemove={
							isSaved
								? () => onRemoveFilter(filter.key)
								: undefined
						}
						onKeyAdd={
							isSaved ? undefined : () => onAddFilter(filter.key)
						}
						onKeyMoveUp={
							isSaved && !isFirstSaved
								? () => onMoveFilterUp(index)
								: undefined
						}
						onKeyMoveDown={
							isSaved && !isLastSaved
								? () => onMoveFilterDown(index)
								: undefined
						}
					/>
				)
			})}
		</Stack>
	)
}

type CustomFiltersButtonProps = {
	product: ProductType
	startDate: Date
	endDate: Date
	selectedKeys: string[]
	onChange: (keys: string[]) => void
}

const CustomFiltersButton: React.FC<CustomFiltersButtonProps> = ({
	product,
	startDate,
	endDate,
	selectedKeys,
	onChange,
}) => {
	const { projectId } = useProjectId()
	const [keyQuery, setKeyQuery] = React.useState('')
	const debouncedQuery = useDebouncedValue(keyQuery) || ''

	const [getKeys, { data, loading }] = useGetKeysLazyQuery()

	const comboBoxOptions = useMemo(() => {
		if (loading) {
			return
		}

		const keyOptions = data?.keys.map((key) => key.name) || selectedKeys

		return keyOptions.map((key) => ({
			key: key,
			render: (
				<Text lines="1" cssClass={style.selectOption} title={key}>
					{key}
				</Text>
			),
		}))
	}, [loading, data?.keys, selectedKeys])

	useEffect(() => {
		if (!debouncedQuery) {
			return
		}

		getKeys({
			variables: {
				product_type: product,
				project_id: projectId!,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: debouncedQuery,
			},
		})
	}, [debouncedQuery, startDate, endDate, product, projectId, getKeys])

	return (
		<ComboboxSelect
			label="Selected filters"
			queryPlaceholder="Search attributes..."
			onChange={onChange}
			icon={<IconSolidDotsHorizontal />}
			loadingRender={<LoadingBox />}
			value={selectedKeys}
			options={comboBoxOptions}
			cssClass={style.selectButton}
			popoverCssClass={style.selectPopover}
			onChangeQuery={setKeyQuery}
		/>
	)
}
