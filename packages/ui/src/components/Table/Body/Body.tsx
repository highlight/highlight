import React from 'react'
import { Box, BoxProps } from '../../Box/Box'

import * as styles from './styles.css'

export interface Props extends Omit<BoxProps, 'cssClass'> {
	children: React.ReactNode
	style?: React.CSSProperties
	onScroll?: React.UIEventHandler<HTMLDivElement>
	forwardRef?: React.Ref<HTMLDivElement>
}

export const Body: React.FC<Props> = ({
	children,
	forwardRef,
	...boxProps
}) => {
	return (
		<Box ref={forwardRef} cssClass={styles.body} {...boxProps}>
			{children}
		</Box>
	)
}
