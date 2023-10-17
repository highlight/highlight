import React from 'react'
import { Box, BoxProps } from '../../Box/Box'

import * as styles from './styles.css'

export type Props = {
	children: React.ReactNode
	height?: BoxProps['height']
	overflowY?: BoxProps['overflowY']
	style?: React.CSSProperties
}

export const Body: React.FC<Props> = ({ children, ...props }) => {
	return (
		<Box cssClass={styles.body} {...props}>
			{children}
		</Box>
	)
}
