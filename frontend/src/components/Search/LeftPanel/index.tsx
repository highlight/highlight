import LoadingBox from '@/components/LoadingBox'
import { useGetKeyValueSuggestionsQuery } from '@/graph/generated/hooks'
import { ProductType } from '@/graph/generated/schemas'
import { Box, Callout } from '@highlight-run/ui/components'
import React from 'react'

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
			py="12"
			px="16"
			style={{ width: 250 }}
			display="flex"
			flexShrink={0}
			flexGrow={0}
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
	const { data, error, loading } = useGetKeyValueSuggestionsQuery({
		variables: {
			product_type: product,
			project_id: '1',
			date_range: {
				start_date: startDate.toISOString(),
				end_date: endDate.toISOString(),
			},
		},
	})

	if (loading) {
		return <LoadingBox />
	}

	if (error) {
		return <Callout title="Failed to load suggestions" kind="error" />
	}

	return (
		<Box
			width="full"
			height="full"
			overflow="auto"
			style={{ position: 'relative' }}
		>
			{data?.key_values_suggestions.map((suggestion) => (
				<Box key={suggestion.key}>{suggestion.key}</Box>
			))}
		</Box>
	)
}
