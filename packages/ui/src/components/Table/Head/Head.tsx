import React from 'react'
import { Box } from '../../Box/Box'

import * as styles from './styles.css'
import clsx from 'clsx'

export type Props = {
	children: React.ReactNode
	className?: string
}

export const Head: React.FC<Props> = ({ children, className }) => {
	return <Box cssClass={clsx(styles.head, className)}>{children}</Box>
}
