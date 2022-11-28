import Tooltip from '@components/Tooltip/Tooltip'
import classNames from 'classnames'
import React from 'react'

import * as style from './BarChart.css'

interface Props {
	data: Array<number>
	xAxis?: string
	yAxis?: string
	height?: number
	width?: number
	maxValue?: number
	selected?: boolean
}

const BarChart = ({
	data,
	xAxis = 'day',
	yAxis = 'occurrence',
	height = 60,
	width = 100,
	maxValue,
	selected,
}: Props) => {
	const max = maxValue ?? Math.max(...data, 5)
	return (
		<div
			style={{ height: height, width: width }}
			className={style.barChartWrapper}
		>
			{data.map((num, ind) => {
				const barHeight = num
					? Math.max((height - 4) * (num / max), 8)
					: 0
				return (
					<Tooltip
						title={`${
							data.length - 1 - ind
						} ${xAxis}(s) ago\n ${num} ${yAxis}(s)`}
						key={ind}
					>
						<div className={style.barDiv}>
							<div
								className={classNames(style.bar, {
									[style.barSelected]: !!selected,
								})}
								style={{
									height: `${barHeight}px`,
								}}
							/>
						</div>
					</Tooltip>
				)
			})}
		</div>
	)
}

export default BarChart
