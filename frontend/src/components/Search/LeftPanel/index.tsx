import React, { useMemo } from 'react'
import { Box, Callout, Stack } from '@highlight-run/ui/components'

import LoadingBox from '@/components/LoadingBox'
import { SearchExpression } from '@/components/Search/Parser/listener'
import { useSearchContext } from '@/components/Search/SearchContext'
import { BODY_KEY } from '@/components/Search/SearchForm/utils'
import { parseSearch } from '@/components/Search/utils'
import { useGetKeyValueSuggestionsQuery } from '@/graph/generated/hooks'
import { ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'

import { Filter } from './Filter'

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
	const { data, error, loading } = useGetKeyValueSuggestionsQuery({
		variables: {
			product_type: product,
			project_id: projectId,
			date_range: {
				start_date: startDate.toISOString(),
				end_date: endDate.toISOString(),
			},
		},
	})

	const { initialQuery: searchedQuery, query, onSubmit } = useSearchContext()

	const queryParts = useMemo(() => {
		return parseSearch(searchedQuery).queryParts
	}, [searchedQuery])

	const filters = useMemo(() => {
		const filtersMap: Map<string, Map<string, boolean>> = new Map()

		// add filter suggestions
		data?.key_values_suggestions?.forEach((suggestion) => {
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
				const values = value.slice(1, -1).split(' OR ')

				values.forEach((v) => {
					addValueToKey(filtersMap, part.key, v, true)
				})
			} else {
				addValueToKey(filtersMap, part.key, value, true)
			}
		})

		const allFilters: {
			key: string
			values: { value: string; selected: boolean }[]
		}[] = []

		filtersMap.forEach((values, key) => {
			allFilters.push({
				key,
				values: Array.from(values).map(([value, selected]) => ({
					value,
					selected,
				})),
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
				newPart.text = newPart.text
					.replace(
						new RegExp(`\\b${key}=([^()]+)`, 'g'),
						`${key}=\($1 OR ${value})`,
					) // Add 'value' to 'key=value'
					.replace(
						new RegExp(`\\b${key}=\\(([^)]+)\\)`, 'g'),
						(_, values) =>
							`${key}=(${values.includes(value) ? values : values + ' OR ' + value})`,
					) // Add 'value' to 'key=(values)'

				acc.push(newPart)
			} else {
				newPart.text = part.text
					.replace(
						new RegExp(
							`\\bOR\\s+${value}\\b|\\b${value}\\s+OR\\b`,
							'g',
						),
						'',
					) // Remove 'OR value' or 'value OR'
					.replace(
						new RegExp(`(${key}=\\(?)${value}(\\)?)`, 'g'),
						(_, before, after) =>
							before && after ? before + after : '',
					) // Remove value if alone
					.replace(/\(\s+/g, '(') // Remove extra spaces after '('
					.replace(/\s+\)/g, ')') // Remove extra spaces before ')'
					.replace(/\(\s*\)/g, '') // Remove empty parentheses '()'
					.replace(/\s*OR\s*/g, ' OR ') // Normalize spaces around OR
					.replace(new RegExp(`\\b${key}=\\s*$`, 'g'), '') // Remove empty key
					.trim() // Ensure no leading/trailing spaces

				if (newPart.text !== '') {
					acc.push(newPart)
				}
			}

			return acc
		}, [] as SearchExpression[])

		let newQuery = query
		if (!keyExists && add) {
			// add to existing query if no match and add
			newQuery = `${query} ${key}=${value}`
		} else if (keyExists) {
			// create new query from updated parts
			newQuery = newQueryParts
				.map((part) => part.text)
				.join(' ')
				.trim()
		}

		onSubmit(newQuery)
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
			{filters.map((filter) => (
				<Filter
					product={product}
					startDate={startDate}
					endDate={endDate}
					key={filter.key}
					filter={filter.key}
					values={filter.values}
					onSelect={onSelect}
				/>
			))}
		</Stack>
	)
}

const addValueToKey = (
	filters: Map<string, Map<string, boolean>>,
	key: string,
	value: string,
	selected: boolean,
) => {
	if (!filters.has(key)) {
		filters.set(key, new Map())
	}

	// only overwrite if not defined or false
	if (!filters.get(key)!.get(value)) {
		filters.get(key)!.set(value, selected)
	}
}
