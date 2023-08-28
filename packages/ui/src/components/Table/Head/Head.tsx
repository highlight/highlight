import React from 'react'
import { Box } from '../../Box/Box'
import classnames from 'classnames'

import * as styles from './styles.css'

export type Props = {
	children: React.ReactNode
	className?: string
}

export const Head: React.FC<Props> = ({ children, className }) => {
	return <Box cssClass={classnames(styles.head, className)}>{children}</Box>
}
