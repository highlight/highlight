import React from 'react'
import { Text } from '../../Text/Text'
import { Box } from '../../Box/Box'

import * as styles from './styles.css'

type Props = {
	children: React.ReactNode
}

export const Header: React.FC<Props> = ({ children }) => {
	return (
		<Box cssClass={styles.header}>
			<Text color="weak">{children}</Text>
		</Box>
	)
}
