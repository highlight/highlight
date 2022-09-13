import Tooltip from '@components/Tooltip/Tooltip'
import React, { useEffect, useState } from 'react'

import styles from './BarChart.module.scss'

interface Props {
	data: Array<number>
	xAxis?: string
	yAxis?: string
	height?: number
	width?: number
	sharedMaxNum?: number
	showBase?: boolean
}

const BarChart = ({
	data,
	xAxis = 'day',
	yAxis = 'occurence',
	height = 60,
	width = 100,
	sharedMaxNum,
	showBase = true,
}: Props) => {
	const [maxNum, setMaxNum] = useState(5)

	useEffect(() => {
		if (!!sharedMaxNum) {
			setMaxNum(sharedMaxNum)
		} else {
			setMaxNum(Math.max(...data, 5))
		}
	}, [sharedMaxNum, data])

	return (
		<div
			style={{ height: height, width: width }}
			className={styles.barChartWrapper}
		>
			{data.map((num, ind) => {
				const tmpBarHeight = (height - 4) * (num / maxNum)
				const barHeight =
					tmpBarHeight === 0 ? 0 : Math.max(tmpBarHeight, 3)
				return (
					<Tooltip
						title={`${
							data.length - 1 - ind
						} ${xAxis}(s) ago\n ${num} ${yAxis}(s)`}
						key={ind}
					>
						<div className={styles.barDiv}>
							<div
								className={styles.bar}
								style={{
									height: `${barHeight}px`,
								}}
							/>
							{showBase && <div className={styles.barBase}></div>}
						</div>
					</Tooltip>
				)
			})}
		</div>
	)
}

export default BarChart
