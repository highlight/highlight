import React from 'react'

import { Box } from '../../Box/Box'
import * as styles from './styles.css'

export type Props = React.PropsWithChildren & styles.Variants

export const Truncate = React.forwardRef<unknown, Props>(
	({ children, lines }, ref) => {
		return (
			<Box as="span" ref={ref} cssClass={styles.variants({ lines })}>
				{children}
			</Box>
		)
	},
)

Truncate.displayName = 'Truncate'
