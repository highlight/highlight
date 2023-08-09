import React from 'react'
import { Box } from '../../Box/Box'

import * as styles from './styles.css'

export type Props = {
	children: React.ReactNode
}

export const Discoverable: React.FC<Props> = ({ children }) => {
	return (
		<Box display="flex" cssClass={styles.discoverable}>
			{children}
		</Box>
	)
}
