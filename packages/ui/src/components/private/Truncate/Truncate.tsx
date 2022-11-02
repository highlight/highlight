import React from 'react'
import { Box } from '../../Box/Box'

import * as styles from './styles.css'

export type Props = React.PropsWithChildren & styles.Variants

export const Truncate: React.FC<Props> = ({ children, lines }) => {
	return (
		<Box as="span" cssClass={styles.variants({ lines })}>
			{children}
		</Box>
	)
}
