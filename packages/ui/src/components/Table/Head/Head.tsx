import clsx from 'clsx'
import React from 'react'

import { Box, BoxProps } from '../../Box/Box'
import * as styles from './styles.css'

export interface Props extends Omit<BoxProps, 'cssClass'> {
	children: React.ReactNode
	className?: string
}

export const Head: React.FC<Props> = ({ children, className, ...boxProps }) => {
	return (
		<Box cssClass={clsx(styles.head, className)} {...boxProps}>
			{children}
		</Box>
	)
}
