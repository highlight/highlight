import React from 'react'
import { Box, BoxProps } from '../../Box/Box'

import * as styles from './styles.css'
import clsx from 'clsx'

export interface Props
	extends Omit<
		BoxProps,
		'display' | 'flexDirection' | 'alignItems' | 'gap' | 'cssClass'
	> {
	children: React.ReactNode
	gridColumns?: string[]
	selected?: boolean
	ref?: React.Ref<HTMLDivElement>
}

export const Row: React.FC<Props> = ({
	children,
	gridColumns,
	selected,
	ref,
	...boxProps
}) => {
	const childrenArray = React.Children.toArray(children)
	const defaultGridTemplateColumns = childrenArray.map(() => '1fr').join(' ')

	return (
		<Box
			ref={ref}
			cssClass={clsx(styles.row, { [styles.selected]: selected })}
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
