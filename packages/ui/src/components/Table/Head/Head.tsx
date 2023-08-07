import React from 'react'
import { Box } from '../../Box/Box'

import * as styles from './styles.css'

export type Props = {
	children: React.ReactNode
}

export const Head: React.FC<Props> = ({ children }) => {
	return <Box cssClass={styles.head}>{children}</Box>
}
