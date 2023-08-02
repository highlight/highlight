import React from 'react'
import clsx from 'clsx'

import * as styles from './styles.css'

type Props = {
	children: React.ReactNode
	gridColumns: string
	header?: boolean
}

export const Row: React.FC<Props> = ({ children, gridColumns, header }) => {
	return (
		<div
			className={clsx(styles.row, {
				[styles.header]: header,
			})}
			style={{
				gridTemplateColumns: gridColumns,
			}}
		>
			{children}
		</div>
	)
}
