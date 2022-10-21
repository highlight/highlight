import React from 'react'
import { Box } from '../Box/Box'

import * as styles from './styles.css'

interface Props extends React.PropsWithChildren, styles.Variants {
	as?: React.ReactElement
}

export const Text: React.FC<Props> = ({ as, children, ...props }) => {
	return (
		<Box as={as} className={styles.variants({ ...props })}>
			{children}
		</Box>
	)
}
