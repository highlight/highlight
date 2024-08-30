import Button from '@components/Button/Button/Button'
import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip'
import { Slider } from '@components/Slider/Slider'
import SvgCheckCircleIcon from '@icons/CheckCircleIcon'
import SvgShieldWarningIcon from '@icons/ShieldWarningIcon'
import SvgSkullIcon from '@icons/SkullIcon'
import {
	getMetricValueScore,
	MetricValueScore,
} from '@pages/Player/StreamElement/Renderers/WebVitals/components/Metric'
import clsx from 'clsx'
import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'
import {
	CartesianGrid,
	Label,
	Legend,
	Line,
	LineChart as RechartsLineChart,
	ReferenceArea,
	ReferenceAreaProps,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	XAxisProps,
	YAxis,
} from 'recharts'
import { AxisDomain } from 'recharts/types/util/types'

import styles from './LineChart.module.css'

export const CLICK_NEARBY_THRESHOLD = 4
export const MAX_LEGEND_ITEMS = 16
export const MAX_TOOLTIP_ITEMS = 5

export interface Reference {
	value: number
	color: string
	label?: string
	onDrag?: (y: number) => void
}

export interface Props {
	data: any[]
	domain?: AxisDomain
	referenceLines?: Reference[]
	showReferenceLineLabels?: boolean
	xAxisDataKeyName?: string
	xAxisTickFormatter?: (value: any, index: number) => string
	xAxisProps?: XAxisProps
	hideXAxis?: boolean
	yAxisTickFormatter?: (value: any, index: number) => string
	lineColorMapping: any
	yAxisLabel: string
	hideLegend?: boolean
	referenceAreaProps?: ReferenceAreaProps
	syncId?: string
	onMouseDown?: (e: any) => void
	onMouseMove?: (e: any) => void
	onMouseUp?: (e: any) => void
}

export function findDataDomain(data: any[], key?: string) {
	let max = Number.MIN_VALUE
	let min = Number.MAX_VALUE
	for (const x of data) {
		for (const vS of (key ? [x[key]] : Object.values(x)) || []) {
			const v = Number(vS)
			if (!isFinite(v)) continue
			if (v > max) {
				max = v
			}
			if (v < min) {
				min = v
			}
		}
	}
	const range = max - min
	if (min < 0) {
		min -= 0.1 * range
	}
	max += 0.1 * range
	return { min: Math.floor(min), max: Math.ceil(max) }
}

const LineChart = ({
	referenceLines,
	showReferenceLineLabels,
	xAxisDataKeyName = 'date',
	data,
	domain,
	xAxisTickFormatter,
	hideXAxis = false,
	yAxisTickFormatter,
	lineColorMapping,
	yAxisLabel,
	hideLegend = false,
	referenceAreaProps,
	xAxisProps,
	syncId,
	onMouseDown,
	onMouseMove,
	onMouseUp,
}: Props) => {
	const { min, max } = findDataDomain(data)
	const gridColor = 'none'
	const labelColor = 'var(--color-gray-500)'
	const [dataTypesToShow, setDataTypesToShow] = useState<string[]>([])
	const draggableReferenceLines = referenceLines?.filter((rl) => rl.onDrag)
	const [showTooltip, setShowTooltip] = React.useState(false)

	const isNonXAxisKey = useCallback(
		(keyName: any) =>
			keyName !== xAxisDataKeyName && keyName !== '__typename',
		[xAxisDataKeyName],
	)

	useEffect(() => {
		if (data.length > 0) {
			setDataTypesToShow(Object.keys(data[0]).filter(isNonXAxisKey))
		}
	}, [data, isNonXAxisKey])

	return (
		<>
			{!!draggableReferenceLines?.length && (
				<Slider
					min={min}
					max={max}
					values={draggableReferenceLines.map((rl) => rl.value)}
					onChange={(value) => {
						value.map((v, idx) => {
							const d = draggableReferenceLines[idx].onDrag
							if (d) {
								d(v)
							}
						})
					}}
					orientation="vertical"
				/>
			)}
			<ResponsiveContainer width="100%" height="100%">
				<RechartsLineChart
					data={data}
					syncId={syncId}
					onMouseLeave={() => setShowTooltip(false)}
					onMouseDown={onMouseDown}
					onMouseMove={(e: any) => {
						// Not using mouseEnter because it was unreliable.
						setShowTooltip(true)

						if (typeof onMouseMove === 'function') {
							onMouseMove(e)
						}
					}}
					onMouseUp={onMouseUp}
				>
					<CartesianGrid
						strokeDasharray=""
						vertical={false}
						stroke="var(--color-gray-200)"
					/>
					<XAxis
						dataKey={xAxisDataKeyName}
						tickFormatter={xAxisTickFormatter}
						tick={{ fontSize: '11px', fill: labelColor }}
						tickLine={{ stroke: 'var(--color-gray-200)' }}
						axisLine={{ stroke: gridColor }}
						domain={[min, max]}
						dy={6}
						hide={hideXAxis}
						{...xAxisProps}
					/>
					<YAxis
						tickFormatter={yAxisTickFormatter}
						tick={{ fontSize: '8px', fill: labelColor }}
						tickLine={{ stroke: labelColor, visibility: 'hidden' }}
						axisLine={{ stroke: gridColor }}
						domain={domain}
						type="number"
						dx={-12}
						unit={yAxisLabel}
					/>

					<Tooltip
						position={{ y: 0 }}
						content={
							showTooltip ? (
								<RechartTooltip
									render={(payload: any[]) => (
										<CustomTooltip
											payload={payload}
											yAxisLabel={yAxisLabel}
											referenceLines={referenceLines}
											precision={1}
											units={yAxisLabel}
										/>
									)}
								/>
							) : (
								<></>
							)
						}
					/>

					{!hideLegend && (
						<Legend
							verticalAlign="bottom"
							height={18}
							iconType="square"
							iconSize={8}
							content={(props) => {
								return (
									<CustomLegend
										props={props}
										dataTypesToShow={dataTypesToShow}
										setDataTypesToShow={setDataTypesToShow}
									/>
								)
							}}
						/>
					)}
					{referenceLines?.map((referenceLine, index) => (
						<ReferenceLine
							key={`${referenceLine.label}-${index}`}
							y={referenceLine.value}
							stroke={referenceLine.color}
							strokeDasharray={`${CLICK_NEARBY_THRESHOLD} ${CLICK_NEARBY_THRESHOLD}`}
							strokeWidth={CLICK_NEARBY_THRESHOLD / 2}
							isFront
							ifOverflow="extendDomain"
						>
							{!!showReferenceLineLabels && (
								<>
									<Label
										position="center"
										alignmentBaseline="auto"
										offset={10}
										className={styles.referenceLineValue}
									>
										{referenceLine.label}
									</Label>
								</>
							)}
						</ReferenceLine>
					))}
					{(data.length > 0
						? Object.keys(data[0]).filter(isNonXAxisKey)
						: []
					).map((key) => (
						<Line
							hide={!dataTypesToShow.includes(key)}
							key={key}
							type="linear"
							dataKey={key}
							stroke={lineColorMapping[key]}
							strokeWidth={2}
							animationDuration={100}
							dot={false}
						/>
					))}
					{referenceAreaProps && (
						<ReferenceArea {...referenceAreaProps} isFront />
					)}
				</RechartsLineChart>
			</ResponsiveContainer>
		</>
	)
}

export const CustomTooltip = ({
	yAxisLabel,
	referenceLines,
	precision,
	units,
	payload,
	hideZeroValues,
}: {
	yAxisLabel: string
	referenceLines?: Reference[]
	precision: number
	units: string
	payload: any[]
	hideZeroValues?: boolean
}) => {
	const filteredPayloads = payload
		?.filter((p) => !hideZeroValues || p.value)
		.reverse()
		.slice(0, MAX_TOOLTIP_ITEMS)
	if (hideZeroValues && filteredPayloads.length === 0) {
		return null
	}
	return (
		<>
			<p
				className={clsx(
					'mb-0 flex max-h-48 flex-col items-center gap-x-4 overflow-y-scroll whitespace-nowrap',
					styles.text,
				)}
			>
				{filteredPayloads[0].payload.date && (
					<div className="mb-4 flex w-full flex-row items-center justify-around gap-x-4">
						{moment(filteredPayloads[0].payload.date).format(
							'MMMM Do YYYY, h:mm A',
						)}
					</div>
				)}
				{filteredPayloads.map((entry: any) => {
					return (
						<div key={entry.dataKey} className={styles.tooltipGrid}>
							<span>{entry.dataKey}</span>
							<div
								className={styles.legendIcon}
								style={{
									background: entry.color,
								}}
							></div>
							<span className={styles.tooltipValue}>
								{entry.value?.toFixed
									? entry.value.toFixed(precision)
									: entry.value}
							</span>{' '}
							{yAxisLabel}
							{entry?.payload.range_start ? (
								<>
									{' in '}
									{entry.payload.range_start.toFixed(
										precision,
									)}
									{units} -{' '}
									{entry.payload.range_end.toFixed(precision)}
									{units}
								</>
							) : null}
							{referenceLines?.length &&
							referenceLines?.length >= 2
								? getScoreIcon(
										getMetricValueScore(entry.value, {
											max_good_value:
												referenceLines![0].value,
											max_needs_improvement_value:
												referenceLines![1].value,
										}),
									)
								: undefined}
						</div>
					)
				})}
			</p>
		</>
	)
}

export const CustomLegend = ({
	dataTypesToShow,
	setDataTypesToShow,
	props,
}: {
	dataTypesToShow: string[]
	setDataTypesToShow: React.Dispatch<React.SetStateAction<string[]>>
	props: any
}) => {
	const { payload }: { payload: any[] } = props
	return (
		<div className="flex h-full w-full justify-center align-middle">
			<div className="mt-1 grid w-11/12 grid-cols-4 items-center justify-center gap-x-2 overflow-x-auto">
				{payload?.slice(0, MAX_LEGEND_ITEMS)?.map((entry, index) => (
					<Button
						trackingId="LineChartLegendFilter"
						key={`item-${index}`}
						type="text"
						size="small"
						onClick={() => {
							setDataTypesToShow((previous) => {
								// Toggle off
								if (previous.includes(entry.value)) {
									return previous.filter(
										(e) => e !== entry.value,
									)
								} else {
									// Toggle on
									return [...previous, entry.value]
								}
							})
						}}
						className="flex items-center gap-x-1 overflow-hidden p-0 text-xs text-gray-500"
					>
						<div
							className={clsx(styles.legendIcon, {
								[styles.notShowing]: !dataTypesToShow.includes(
									entry.value,
								),
							})}
							style={{
								background: entry.color,
							}}
						></div>
						<span
							className={clsx(styles.legendValue, {
								[styles.notShowing]: !dataTypesToShow.includes(
									entry.value,
								),
							})}
						>
							{entry.value}
						</span>
					</Button>
				))}
			</div>
		</div>
	)
}

export default LineChart

const getScoreIcon = (score: MetricValueScore) => {
	let icon = <></>
	switch (score) {
		case MetricValueScore.Good:
			icon = <SvgCheckCircleIcon />
			break
		case MetricValueScore.NeedsImprovement:
			icon = <SvgShieldWarningIcon />
			break
		case MetricValueScore.Poor:
			icon = <SvgSkullIcon />
			break
	}

	return <div className={styles.scoreIcon}>{icon}</div>
}
