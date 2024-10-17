import { Box, DateRangePreset } from '@highlight-run/ui/components'
import React from 'react'
import { ReferenceArea, ReferenceLine } from 'recharts'

import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import Graph, {
	getViewConfig,
	SetTimeRange,
} from '@/pages/Graphing/components/Graph'

import * as style from './styles.css'

type Props = {
	alertName: string
	query: string
	productType: ProductType
	functionColumn: string
	functionType: MetricAggregator
	groupByKey?: string
	thresholdWindow: number
	thresholdValue: number
	belowThreshold: boolean
	startDate: Date
	endDate: Date
	selectedPreset?: DateRangePreset
	updateSearchTime: SetTimeRange
}

export const AlertGraph: React.FC<Props> = ({
	alertName,
	query,
	productType,
	functionColumn,
	functionType,
	groupByKey,
	thresholdWindow,
	thresholdValue,
	belowThreshold,
	startDate,
	endDate,
	selectedPreset,
	updateSearchTime,
}) => {
	const { projectId } = useProjectId()
	const sessionsProduct = productType === ProductType.Sessions

	const viewConfig = sessionsProduct
		? getViewConfig('Bar chart', 'Stacked', 'Zero')
		: getViewConfig('Line chart', 'Line', 'Zero')

	return (
		<Box cssClass={style.graphWrapper} shadow="small">
			<Box
				px="16"
				py="12"
				width="full"
				height="full"
				border="divider"
				borderRadius="8"
			>
				<Graph
					title={alertName || 'Untitled alert'}
					viewConfig={viewConfig}
					productType={productType}
					projectId={projectId}
					startDate={startDate}
					selectedPreset={selectedPreset}
					endDate={endDate}
					query={query}
					metric={functionColumn}
					functionType={functionType}
					groupByKeys={
						sessionsProduct ? undefined : [groupByKey ?? '']
					}
					setTimeRange={updateSearchTime}
					bucketByKey="Timestamp"
					bucketCount={sessionsProduct ? 50 : undefined}
					bucketByWindow={
						sessionsProduct ? undefined : thresholdWindow
					}
				>
					{!sessionsProduct && (
						<>
							<ReferenceLine y={thresholdValue} stroke="red" />
							{!belowThreshold && (
								<ReferenceArea
									y1={thresholdValue}
									opacity={0.5}
									isFront
								/>
							)}
							{belowThreshold && (
								<ReferenceArea
									y2={thresholdValue}
									opacity={0.5}
									isFront
								/>
							)}
						</>
					)}
				</Graph>
			</Box>
		</Box>
	)
}
