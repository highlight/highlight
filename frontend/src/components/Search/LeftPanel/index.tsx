import LoadingBox from '@/components/LoadingBox'
import { Filter } from '@/components/Search/LeftPanel/Filter'
import { SearchExpression } from '@/components/Search/Parser/listener'
import { useSearchContext } from '@/components/Search/SearchContext'
import { useGetKeyValueSuggestionsQuery } from '@/graph/generated/hooks'
import { ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { Box, Callout, Stack } from '@highlight-run/ui/components'
import React, { useMemo } from 'react'

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
			position="relative"
			py="4"
			px="8"
			style={{ width: 250 }}
			display="flex"
			flexShrink={0}
			flexGrow={0}
			overflowX="hidden"
			overflowY="auto"
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

	const { query, queryParts, onSubmit } = useSearchContext()

	const selectedFilters = useMemo(() => {
		const filters: Record<string, Record<string, boolean>> = {}

		queryParts.forEach((part) => {
			if (part.operator !== '=') {
				return
			}

			filters[part.key] ||= {}

			const value = part.value.trim()

			if (value.startsWith('(') && value.endsWith(')')) {
				const values = value.slice(1, -1).split(' OR ')

				values.forEach((v) => {
					filters[part.key][v] = true
				})
			} else {
				filters[part.key][value] = true
			}
		})

		return filters
	}, [queryParts])

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
					.replace(new RegExp(`\\b${value}\\b`, 'g'), '') // Remove 'value' if alone
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
		return <Callout title="Failed to load suggestions" kind="error" />
	}

	return (
		<Stack
			width="full"
			height="full"
			overflow="auto"
			style={{ position: 'relative' }}
			gap="8"
		>
			{data?.key_values_suggestions.map((suggestion) => (
				<Filter
					key={suggestion.key}
					filter={suggestion.key}
					values={suggestion.values}
					onSelect={onSelect}
					selectedValues={selectedFilters[suggestion.key] || {}}
				/>
			))}
		</Stack>
	)
}
