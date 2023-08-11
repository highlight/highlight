import React from 'react'
import { Box } from '../../Box/Box'

import * as styles from './styles.css'

export type Props = {
	children: React.ReactNode
}

export const Body: React.FC<Props> = ({ children }) => {
	return <Box cssClass={styles.body}>{children}</Box>
}
