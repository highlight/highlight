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

const EditorBackground = () => {
	return (
		<svg width="100%" height="100%">
			<defs>
				<pattern
					id="polka-dots"
					x="0"
					y="0"
					width="14"
					height="14"
					patternUnits="userSpaceOnUse"
				>
					<circle fill="#e4e2e4" cx="7" cy="7" r="1" />
				</pattern>
			</defs>

			<rect
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill="url(#polka-dots)"
			/>
		</svg>
	)
}

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
		<Box
			display="flex"
			position="relative"
			height="full"
			cssClass={style.previewWindow}
		>
			<Box
				position="absolute"
				width="full"
				height="full"
				cssClass={style.graphBackground}
			>
				<EditorBackground />
			</Box>

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
						groupByKey={sessionsProduct ? undefined : groupByKey}
						setTimeRange={updateSearchTime}
						bucketByKey="Timestamp"
						bucketCount={sessionsProduct ? 50 : undefined}
						bucketByWindow={
							sessionsProduct ? undefined : thresholdWindow
						}
					>
						{!sessionsProduct && (
							<>
								<ReferenceLine
									y={thresholdValue}
									stroke="red"
								/>
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
		</Box>
	)
}
