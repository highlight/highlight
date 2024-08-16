import React from 'react'

import { Box, BoxProps } from '../../Box/Box'

export interface Props extends Omit<BoxProps, 'cssClass'> {
	children: React.ReactNode
	style?: React.CSSProperties
	onScroll?: React.UIEventHandler<HTMLDivElement>
}

export const Body = React.forwardRef<unknown, Props>(
	({ children, ...boxProps }, ref) => {
		return (
			<Box ref={ref} {...boxProps}>
				{children}
			</Box>
		)
	},
)
