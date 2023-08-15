import React from 'react'
import { Box, BoxProps } from '../../Box/Box'

import * as styles from './styles.css'

export interface Props
	extends Omit<
		BoxProps,
		'display' | 'flexDirection' | 'alignItems' | 'gap' | 'cssClass'
	> {
	children: React.ReactNode
	icon?: React.ReactNode
}

export const Cell: React.FC<Props> = ({ children, icon, ...boxProps }) => {
	return (
		<Box
			display="flex"
			flexDirection="row"
			alignItems="center"
			gap="6"
			cssClass={styles.cell}
			{...boxProps}
		>
			{icon && (
				<Box as="span" display="inline-flex">
					{icon}
				</Box>
			)}
			{children}
		</Box>
	)
}
