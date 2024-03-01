import clsx from 'clsx'
import React from 'react'

import { Box, BoxProps } from '../../Box/Box'
import * as styles from './styles.css'

export interface Props extends Omit<BoxProps, 'cssClass'> {
	children: React.ReactNode
	gridColumns?: string[]
	selected?: boolean
	className?: string
	forwardRef?: React.Ref<HTMLDivElement>
}

export const Row: React.FC<Props> = ({
	children,
	gridColumns,
	selected,
	forwardRef,
	className,
	...boxProps
}) => {
	const childrenArray = React.Children.toArray(children)
	const defaultGridTemplateColumns = childrenArray.map(() => '1fr').join(' ')

	return (
		<Box
			ref={forwardRef}
			cssClass={clsx(styles.row, className, {
				[styles.selected]: selected,
			})}
			cursor={boxProps.onClick ? 'pointer' : undefined}
			style={{
				gridTemplateColumns: gridColumns
					? gridColumns.join(' ')
					: defaultGridTemplateColumns,
			}}
			{...boxProps}
		>
			{children}
		</Box>
	)
}
