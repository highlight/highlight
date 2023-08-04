import React from 'react'
import { Box } from '../../Box/Box'

import * as styles from './styles.css'

export type Props = {
	children: React.ReactNode
	icon?: React.ReactNode
}

export const Cell: React.FC<Props> = ({ children, icon }) => {
	return (
		<Box
			display="flex"
			flexDirection="row"
			alignItems="center"
			gap="6"
			cssClass={styles.cell}
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
