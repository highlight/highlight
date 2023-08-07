import React from 'react'

import * as styles from './styles.css'

export type Props = {
	children: React.ReactNode
	gridColumns: string[]
}

export const Row: React.FC<Props> = ({ children, gridColumns }) => {
	return (
		<div
			className={styles.row}
			style={{
				gridTemplateColumns: gridColumns.join(' '),
			}}
		>
			{children}
		</div>
	)
}
