import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip'
import React from 'react'
import {
	Area,
	AreaChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

import styles from './StackedAreaChart.module.scss'

interface Props {
	data: any[]
	xAxisKey: string
	heightPercent?: string
	strokeColor: string
	fillColor: string
	showXAxis?: boolean
	xAxisTickFormatter?: (value: any, index: number) => string
	yAxisTickFormatter?: (value: any, index: number) => string
	onClickHandler?: (event: any) => void
	referenceLineProps?: {
		x?: number
		y?: number
		stroke?: string
	}
	yAxisLabel: string
	tooltipIcon?: React.ReactNode
	chartLabel?: string
	/** This is used to align multiple charts. */
	syncId?: string
}

const StackedAreaChart = ({
	data,
	xAxisKey,
	heightPercent = '100%',
	strokeColor,
	fillColor,
	showXAxis = true,
	xAxisTickFormatter,
	yAxisTickFormatter,
	onClickHandler,
	referenceLineProps,
	yAxisLabel,
	tooltipIcon,
	chartLabel,
	syncId,
}: Props) => {
	return (
		<div
			className={styles.chartContainer}
			style={{ height: heightPercent }}
		>
			{chartLabel && (
				<div className={styles.chartLabelContainer}>
					<p
						style={{
							color: strokeColor,
						}}
					>
						{chartLabel}
					</p>
				</div>
			)}
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					width={500}
					height={400}
					data={data}
					margin={{
						top: 32,
						right: 32,
						left: 0,
						bottom: 8,
					}}
					onClick={onClickHandler}
					syncId={syncId}
				>
					<XAxis
						dataKey={xAxisKey}
						tickFormatter={xAxisTickFormatter}
						fontSize={10}
						hide={!showXAxis}
						tick={{ fill: 'var(--color-gray-500)' }}
					/>

					<YAxis
						fontSize={10}
						tickLine={{ visibility: 'hidden' }}
						axisLine={{ visibility: 'hidden' }}
						tickFormatter={yAxisTickFormatter}
						tick={{ fill: 'var(--color-gray-500)' }}
					/>

					{referenceLineProps && (
						<ReferenceLine {...referenceLineProps} isFront={true} />
					)}
					<Tooltip
						position={{ y: 0 }}
						content={
							<RechartTooltip
								render={(payload: any) => {
									return (
										<div
											className={
												styles.tooltipContentContainer
											}
										>
											{payload.map((entry: any) => {
												return (
													<p key={entry.dataKey}>
														{tooltipIcon &&
															tooltipIcon}
														<span>
															{entry.value &&
															yAxisTickFormatter
																? yAxisTickFormatter(
																		entry.value,
																		0,
																  )
																: entry.value.toFixed(
																		2,
																  )}{' '}
															<span
																className={
																	styles.label
																}
															>
																{yAxisLabel}
															</span>
														</span>
													</p>
												)
											})}
										</div>
									)
								}}
							/>
						}
					/>
					{data.length > 0 &&
						Object.keys(data[0]).map((key) => {
							if (key === xAxisKey) {
								return null
							}

							return (
								<Area
									key={key}
									type="step"
									dataKey={key}
									stackId="1"
									stroke={strokeColor}
									fill={fillColor}
								/>
							)
						})}
				</AreaChart>
			</ResponsiveContainer>
		</div>
	)
}

export default StackedAreaChart
