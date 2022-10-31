import React from 'react'
import { Sprinkles } from '../../css/sprinkles.css'
import { Box } from '../Box/Box'

import * as styles from './styles.css'

type Props = React.PropsWithChildren & {
	size: 'h1' | 'h2' | 'h3' | 'h4'
	paddingBottom?: Sprinkles['paddingBottom']
	paddingTop?: Sprinkles['paddingTop']
}

export const Heading: React.FC<Props> = ({ children, size, ...props }) => {
	return (
		<Box as={size} cssClass={styles.variants({ size })} {...props}>
			{children}
		</Box>
	)
}
