import React from 'react'

import * as styles from './styles.css'

export type Props = {
	children: React.ReactNode
	gridColumns?: string[]
}

export const Row: React.FC<Props> = ({ children, gridColumns }) => {
	const childrenArray = React.Children.toArray(children)
	const defaultGridTemplateColumns = childrenArray.map(() => '1fr').join(' ')

	return (
		<div
			className={styles.row}
			style={{
				gridTemplateColumns: gridColumns
					? gridColumns.join(' ')
					: defaultGridTemplateColumns,
			}}
		>
			{children}
		</div>
	)
}
