import React from 'react'
import { Box } from '../Box/Box'

import * as styles from './styles.css'

interface Props extends React.PropsWithChildren, styles.Variants {}

export const Text: React.FC<Props> = ({ children, ...props }) => {
	return <Box className={styles.variants({ ...props })}>{children}</Box>
}
