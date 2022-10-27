import React from 'react'
import { Box } from '../Box/Box'

import * as styles from './styles.css'

type Props = React.PropsWithChildren & styles.Variants & {}

export const Divider: React.FC<Props> = ({ children, ...props }) => {
	return <Box cssclass={styles.variants({ ...props })}>{children}</Box>
}
