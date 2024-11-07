import { Box, DateRangePreset } from '@highlight-run/ui/components'
import React from 'react'
import { ReferenceArea, ReferenceLine } from 'recharts'

import {
	MetricAggregator,
	ProductType,
	ThresholdCondition,
	ThresholdType,
} from '@/graph/generated/schemas'
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
	thresholdType: ThresholdType
	thresholdCondition: ThresholdCondition
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
	thresholdType,
	thresholdCondition,
	startDate,
	endDate,
	selectedPreset,
	updateSearchTime,
}) => {
	const { projectId } = useProjectId()
	const sessionsProduct =
		productType === ProductType.Sessions &&
		thresholdType === ThresholdType.Constant

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
						sessionsProduct || groupByKey === undefined
							? undefined
							: [groupByKey]
					}
					setTimeRange={updateSearchTime}
					bucketByKey="Timestamp"
					bucketCount={sessionsProduct ? 50 : undefined}
					bucketByWindow={
						sessionsProduct ? undefined : thresholdWindow
					}
					predictionSettings={
						thresholdType === ThresholdType.Anomaly
							? {
									changepointPriorScale: 0.25,
									intervalWidth: thresholdValue,
									thresholdCondition,
									intervalSeconds: thresholdWindow,
								}
							: undefined
					}
					thresholdSettings={{
						thresholdCondition,
						thresholdType,
						thresholdValue,
					}}
				>
					{!sessionsProduct &&
						thresholdType === ThresholdType.Constant && (
							<>
								<ReferenceLine
									y={thresholdValue}
									strokeWidth="2px"
									strokeDasharray="8 8"
									strokeLinecap="round"
									stroke="#C8C7CB"
								/>
								{thresholdCondition ===
									ThresholdCondition.Below && (
									<ReferenceArea
										y1={thresholdValue}
										isFront
										fill="#F9F8F9"
									/>
								)}
								{thresholdCondition ===
									ThresholdCondition.Above && (
									<ReferenceArea
										y2={thresholdValue}
										isFront
										fill="#F9F8F9"
									/>
								)}
							</>
						)}
				</Graph>
			</Box>
		</Box>
	)
}
