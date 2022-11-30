import React from 'react'

import styles from './RechartTooltip.module.scss'

export const RechartTooltip = ({
	active,
	payload,
	label,
	render,
	hideZeroValues,
}: {
	render?: (payload: any[]) => React.ReactNode
	active?: boolean
	payload?: any[]
	label?: string
	hideZeroValues?: boolean
}) => {
	if (hideZeroValues && !payload?.filter((p) => p.value)?.length) {
		return null
	}
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
