import tinycolor from '@ctrl/tinycolor'
import { Box, Text } from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Bar, BarChart, Cell, ReferenceArea, Tooltip } from 'recharts'

import styles from './Histogram.module.scss'

export interface Series {
	label: string
	color: keyof typeof colors
	counts: number[]
}

const POPOVER_TIMEOUT_MS = 500
const BAR_RADIUS_PX = 4

interface Props {
	bucketTimes: number[]
	onAreaChanged: (left: number, right: number) => void
	onBucketClicked: (bucketIndex: number) => void
	seriesList: Series[]
	timeFormatter: (value: number) => string
	barGap?: number
}

const Histogram = React.memo(
	({
		onAreaChanged,
		onBucketClicked,
		seriesList,
		bucketTimes,
		barGap = 3,
	}: Props) => {
		const [dragStart, setDragStart] = useState<number | undefined>()
		const [dragEnd, setDragEnd] = useState<number | undefined>()
		const [tooltipHidden, setTooltipHidden] = useState(true)
		const [tooltipWantHidden, setTooltipWantHidden] = useState(true)

		let dragLeft: number | undefined
		let dragRight: number | undefined
		if (dragStart !== undefined && dragEnd !== undefined) {
			dragLeft = Math.min(dragStart, dragEnd)
			dragRight = Math.max(dragStart, dragEnd)
		}

		const bucketStartTimes = bucketTimes.slice(0, -1)
		const seriesLength = bucketStartTimes.length

		const chartData: {
			[key: string]: string | number
		}[] = []
		for (const {} of bucketStartTimes) {
			chartData.push({})
		}

		for (const s of seriesList) {
			for (let i = 0; i < seriesLength; i++) {
				chartData[i][s.label] = s.counts[i]
			}
		}

		const firstSeries: string[] = []
		const lastSeries: string[] = []

		const reversedSeriesList = seriesList.slice().reverse()
		for (let i = 0; i < seriesLength; i++) {
			const curData = chartData[i]
			for (const s of seriesList) {
				if (curData[s.label]) {
					firstSeries[i] = s.label
					break
				}
			}
			for (const s of reversedSeriesList) {
				if (curData[s.label]) {
					lastSeries[i] = s.label
					break
				}
			}
		}

		useEffect(() => {
			// Return if tooltip is already in the state we want
			// Any existing timeout will be cleared
			if (tooltipWantHidden === tooltipHidden) {
				return
			}

			const id = setTimeout(
				tooltipWantHidden
					? () => setTooltipHidden(true)
					: () => setTooltipHidden(false),
				POPOVER_TIMEOUT_MS,
			)

			return () => {
				clearTimeout(id)
			}
		}, [tooltipHidden, tooltipWantHidden])

		// assert all series have the same length
		if (!seriesList.every((s) => s.counts.length === seriesLength)) {
			console.error('all series must have the same length', {
				seriesList,
				bucketStartTimes,
			})
			return null
		}

		return (
			<div className={styles.container}>
				<div>
					<AutoSizer>
						{({ height, width }) => (
							<BarChart
								data={chartData}
								barGap={barGap}
								barCategoryGap={barGap}
								margin={{
									top: 0,
									right: 0,
									left: 0,
									bottom: 0,
								}}
								height={height}
								width={width}
								onMouseDown={(e: any) => {
									if (!e) {
										return
									}
									setDragStart(e.activeLabel)
									setDragEnd(e.activeLabel)
								}}
								onMouseMove={(e: any) => {
									if (!e) {
										return
									}
									setTooltipWantHidden(false)
									if (dragStart !== undefined) {
										setDragEnd(e.activeLabel)
									}
								}}
								onMouseUp={() => {
									if (
										dragLeft !== undefined &&
										dragRight !== undefined
									) {
										if (dragLeft === dragRight) {
											onBucketClicked(dragLeft)
										} else {
											onAreaChanged(dragLeft, dragRight)
										}
									}
									setDragStart(undefined)
									setDragEnd(undefined)
								}}
								onMouseLeave={() => {
									setDragStart(undefined)
									setDragEnd(undefined)
									setTooltipWantHidden(true)
								}}
								onMouseEnter={() => {
									setTooltipWantHidden(false)
								}}
							>
								<Tooltip
									content={
										tooltipHidden ? undefined : (
											<CustomTooltip
												seriesList={seriesList}
												bucketTimes={bucketTimes}
												setTooltipWantHidden={
													setTooltipWantHidden
												}
											/>
										)
									}
									wrapperStyle={{
										bottom: '100%',
										top: 'none',
										position: 'absolute',
										zIndex: 100,
										overflow: 'auto',
										visibility: tooltipHidden
											? 'hidden'
											: 'visible',
										pointerEvents: 'inherit',
									}}
									cursor={{
										fill:
											dragLeft !== undefined &&
											dragRight !== undefined
												? 'transparent'
												: 'rgba(204, 204, 204, .5)',
										radius: 3,
									}}
									allowEscapeViewBox={{
										x: false,
										y: false,
									}}
								/>
								{seriesList.map((s) => (
									<Bar
										isAnimationActive={false}
										key={s.label}
										dataKey={s.label}
										stackId="a"
										fill={colors[s.color]}
									>
										{chartData.map((entry, i) => {
											const isFirst =
												firstSeries[i] === s.label
											const isLast =
												lastSeries[i] === s.label

											return (
												<Cell
													key={`cell-${i}`}
													// @ts-ignore
													radius={[
														isLast
															? BAR_RADIUS_PX
															: 0,
														isLast
															? BAR_RADIUS_PX
															: 0,
														isFirst
															? BAR_RADIUS_PX
															: 0,
														isFirst
															? BAR_RADIUS_PX
															: 0,
													]}
												/>
											)
										})}
									</Bar>
								))}
								{dragStart !== undefined &&
								dragEnd !== undefined ? (
									<ReferenceArea
										x1={dragLeft}
										x2={dragRight}
									/>
								) : null}
							</BarChart>
						)}
					</AutoSizer>
				</div>
			</div>
		)
	},
)

const CustomTooltip: React.FC<{
	setTooltipWantHidden: (value: React.SetStateAction<boolean>) => void
	bucketTimes: number[]
	payload?: any[]
	label?: number
	seriesList: Series[]
}> = ({ bucketTimes, seriesList, payload, label, setTooltipWantHidden }) => {
	if (!payload || !payload.length || !label) {
		return null
	}

	const currentTime = bucketTimes[label]

	return (
		<Box
			alignItems="center"
			borderRadius="6"
			border="neutral"
			display="flex"
			gap="4"
			p="4"
			background="white"
			onMouseOver={() => {
				setTooltipWantHidden(false)
			}}
			onMouseLeave={() => {
				setTooltipWantHidden(true)
			}}
		>
			<Text color="neutral300" size="xSmall" weight="medium">
				{moment(currentTime).format('MMM D')}
			</Text>

			{payload.map((p, index) => {
				const series = seriesList.find((s) => s.label === p.dataKey)
				const color = series?.color || 'black'
				const colorIsDark = tinycolor(p.color).getBrightness() < 165

				return (
					<Box
						key={index}
						borderRadius="3"
						backgroundColor={color}
						p="4"
					>
						<Text color={colorIsDark ? 'white' : 'neutral700'}>
							{p.value} {p.name}
						</Text>
					</Box>
				)
			})}
		</Box>
	)
}

export default Histogram
