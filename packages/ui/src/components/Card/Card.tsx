import React from 'react'
import type { Sprinkles } from '../../css/sprinkles.css'
import { Box } from '../Box/Box'

import * as styles from './styles.css'

export type Props = React.PropsWithChildren & styles.Variants

export const Card: React.FC<Props> = ({ children, ...rest }) => {
	const defaultProps: Partial<Sprinkles> = {
		background: {
			lightMode: 'white',
			darkMode: 'p12',
		},
		color: {
			lightMode: 'black',
			darkMode: 'white',
		},
	}

	return (
		<Box {...defaultProps} cssClass={styles.variants({ ...rest })}>
			{children}
		</Box>
	)
}
