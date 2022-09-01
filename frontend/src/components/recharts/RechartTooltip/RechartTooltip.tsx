import React from 'react'

import styles from './RechartTooltip.module.scss'

export const RechartTooltip = ({ active, payload, label, render }: any) => {
	if (active && payload && payload.length) {
		return (
			<div className={styles.tooltip}>
				{render ? (
					render(payload)
				) : (
					<>
						<h4>{label}</h4>
						<p>
							{payload[0].value} {payload[0].payload.label}
						</p>
						{payload[0].payload.label && (
							<>
								<br />
								<p>Click to see {payload[0].payload.label}.</p>
							</>
						)}
					</>
				)}
			</div>
		)
	}

	return null
}
