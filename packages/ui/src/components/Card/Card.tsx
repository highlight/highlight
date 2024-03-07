import React from 'react'

import { Box } from '../Box/Box'
import * as styles from './styles.css'

export type Props = React.PropsWithChildren & styles.Variants

export const Card: React.FC<Props> = ({ children, ...rest }) => {
	return <Box cssClass={styles.variants({ ...rest })}>{children}</Box>
}
