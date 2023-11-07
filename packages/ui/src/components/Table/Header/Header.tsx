import React from 'react'
import { Box } from '../../Box/Box'

import * as styles from './styles.css'
import { Text } from '../../../components/Text/Text'

export type Props = {
	children?: React.ReactNode
}

export const Header: React.FC<Props> = ({ children }) => {
	return (
		<Box cssClass={styles.header}>
			<Text size="xSmall">{children}</Text>
		</Box>
	)
}
