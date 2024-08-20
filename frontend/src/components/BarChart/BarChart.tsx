import { Tooltip } from '@highlight-run/ui/components'
import clsx from 'clsx'

import * as style from './BarChart.css'

interface Props {
	data: Array<number>
	xAxis?: string
	yAxis?: string
	height?: number
	width?: number | string
	maxValue?: number
	minBarHeight?: number
	selected?: boolean
	barGap?: number
}

const BarChart = ({
	data,
	xAxis = 'day',
	yAxis = 'occurrence',
	height = 60,
	width = 100,
	maxValue,
	minBarHeight,
	selected,
	barGap = 3,
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
					: (minBarHeight ?? 0)
				return (
					<Tooltip
						key={ind}
						trigger={
							<div
								className={style.barDiv}
								style={{
									paddingLeft: barGap / 2,
									paddingRight: barGap / 2,
								}}
							>
								<div
									className={clsx(style.bar, {
										[style.barSelected]: !!selected,
									})}
									style={{
										height: `${barHeight}px`,
										width: 3,
									}}
								/>
							</div>
						}
					>
						{`${
							data.length - 1 - ind
						} ${xAxis}(s) ago\n ${num} ${yAxis}(s)`}
					</Tooltip>
				)
			})}
		</div>
	)
}

export default BarChart
