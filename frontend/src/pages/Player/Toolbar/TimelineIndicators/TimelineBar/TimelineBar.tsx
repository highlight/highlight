import styles from './TimelineBar.module.scss'
export interface IBarRectangle {
	color: string
	percent: number
}

interface IBar {
	data: IBarRectangle[]
	left: number
	barWidth: number
	margin: number
}

const TimelineIndicatorsBar = ({ data, barWidth, left, margin }: IBar) => {
	const totalPercent = data
		.map((rect) => rect.percent)
		.reduce((acc, curr) => acc + curr, 0)
	return (
		<div
			className={styles.bar}
			style={{
				width: `${barWidth}%`,
				left: `${left}%`,
			}}
		>
			{totalPercent ? (
				<div
					className={styles.rectangleContainer}
					style={{
						margin,
						height: `${totalPercent}%`,
						width: `calc(100% - ${margin}px)`,
					}}
				>
					{data.map((rect, idx) => {
						return (
							<div
								className={styles.barRectangle}
								style={{
									background: `${rect.color}`,
									height: `${
										(rect.percent / totalPercent) * 100
									}%`,
								}}
								key={idx}
							></div>
						)
					})}
				</div>
			) : null}
		</div>
	)
}

export default TimelineIndicatorsBar
