import React from 'react'

import { Box } from '../Box/Box'
import * as styles from './styles.css'

export type Props = React.PropsWithChildren &
	styles.Variants & { cssClass?: string }

export const Card: React.FC<Props> = ({ children, cssClass, ...rest }) => {
	return (
		<Box cssClass={[styles.variants({ ...rest }), cssClass]}>
			{children}
		</Box>
	)
}
