import { Text } from '@highlight-run/ui'
import React from 'react'

import styles from './ErrorDistribution.module.scss'

type Props = {
	totalCount: number
	// TODO(spenny): add types
	errorCategoryCounts: any
	errorColors: any
}

const ErrorDistribution: React.FC<Props> = ({
	totalCount,
	errorCategoryCounts,
	errorColors,
}) => {
	if (!totalCount || !Object.keys(errorCategoryCounts).length) {
		return null
	}

	// TODO(spenny): use for tooltip
	// const categoryBars = Object.keys(errorCategoryCounts).map((category) => ({
	// 	label: category,
	// 	percentage: Math.round(errorCategoryCounts[category] / totalCount),
	// 	color: errorColors[category],
	// }))

	return (
		<>
			<Text weight="bold" cssClass={styles.label}>
				Distribution
			</Text>
			<div className={styles.distributionContainer}>
				{Object.keys(errorCategoryCounts).map((category) => {
					const percentage = Math.round(
						(errorCategoryCounts[category] * 100) / totalCount,
					)
					return (
						<div
							key={category}
							className={styles.percentageBar}
							style={{
								backgroundColor: errorColors[category],
								width: `${percentage}%`,
								height: '100%',
							}}
						/>
					)
				})}
			</div>
		</>
	)
}

export default ErrorDistribution
