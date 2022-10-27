import React from 'react'
import { Box } from '../Box/Box'

import * as styles from './styles.css'

type Props = React.PropsWithChildren & {
	size: 'h1' | 'h2' | 'h3' | 'h4'
}

export const Heading: React.FC<Props> = ({ children, size }) => {
	return (
		<Box as={size} cssClass={styles.variants({ size })}>
			{children}
		</Box>
	)
}
