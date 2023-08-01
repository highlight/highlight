import React from 'react'
import { Box } from '../../Box/Box'

import * as styles from './styles.css'

type Props = {
	children: React.ReactNode
}

export const Head: React.FC<Props> = ({ children }) => {
	return <Box className={styles.header}>{children}</Box>
}
