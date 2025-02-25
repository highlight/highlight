import { Box } from '@highlight-run/ui/components'
import React, { useMemo } from 'react'
import { ReferenceArea, ReferenceLine } from 'recharts'
import moment from 'moment'

import {
	MetricAggregator,
	ProductType,
	ThresholdCondition,
	ThresholdType,
} from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import Graph, { SetTimeRange } from '@/pages/Graphing/components/Graph'

import { BarChartConfig } from '@/pages/Graphing/components/BarChart'
import { LineChartConfig } from '@/pages/Graphing/components/LineChart'
import { TableConfig } from '@/pages/Graphing/components/Table'

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
	updateSearchTime: SetTimeRange
	sql?: string
}

const BAR_CONFIG: BarChartConfig = {
	type: 'Bar chart',
	showLegend: true,
	display: 'Stacked',
}

const LINE_CONFIG: LineChartConfig = {
	type: 'Line chart',
	showLegend: true,
	display: 'Line',
	nullHandling: 'Zero',
}

const TABLE_CONFIG: TableConfig = {
	type: 'Table',
	showLegend: false,
	nullHandling: 'Hide row',
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
	updateSearchTime,
	sql,
}) => {
	const { projectId } = useProjectId()
	const sessionsProduct =
		!sql &&
		productType === ProductType.Sessions &&
		thresholdType === ThresholdType.Constant

	const viewConfig = sql
		? TABLE_CONFIG
		: sessionsProduct
			? BAR_CONFIG
			: LINE_CONFIG

	// For SQL, only show the value for the current window
	const start = useMemo(() => {
		if (sql) {
			return moment(endDate).subtract(thresholdWindow, 'seconds').toDate()
		} else {
			return startDate
		}
	}, [endDate, sql, startDate, thresholdWindow])

	return (
		<Box px="16" py="12" width="full" height="full" borderRadius="8">
			<Graph
				title={alertName || 'Untitled alert'}
				viewConfig={viewConfig}
				productType={productType}
				projectId={projectId}
				startDate={start}
				endDate={endDate}
				query={query}
				groupByKeys={
					sessionsProduct || groupByKey === undefined
						? undefined
						: [groupByKey]
				}
				setTimeRange={updateSearchTime}
				bucketByKey="Timestamp"
				bucketCount={sessionsProduct ? 50 : undefined}
				bucketByWindow={sessionsProduct ? undefined : thresholdWindow}
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
				expressions={[
					{ aggregator: functionType, column: functionColumn },
				]}
				sql={sql}
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
	)
}
