import React from 'react'
import type { Sprinkles } from '../../css/sprinkles.css'
import { Box } from '@components'

import * as styles from './styles.css'

export type Props = React.PropsWithChildren & styles.Variants

export const Card: React.FC<Props> = ({ children, ...rest }) => {
	const defaultProps: Partial<Sprinkles> = {
		background: {
			lightMode: 'white',
			darkMode: 'purple900',
		},
		color: {
			lightMode: 'black',
			darkMode: 'white',
		},
	}

	return (
		<Box {...defaultProps} className={styles.variants({ ...rest })}>
			{children}
		</Box>
	)
}
