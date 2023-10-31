import React from 'react'

import * as styles from './styles.css'
import clsx from 'clsx'

export type Props = {
	children: React.ReactNode
	gridColumns?: string[]
	selected?: boolean
}

export const Row: React.FC<Props> = ({ children, gridColumns, selected }) => {
	const childrenArray = React.Children.toArray(children)
	const defaultGridTemplateColumns = childrenArray.map(() => '1fr').join(' ')

	return (
		<div
			className={clsx(styles.row, { [styles.selected]: selected })}
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
