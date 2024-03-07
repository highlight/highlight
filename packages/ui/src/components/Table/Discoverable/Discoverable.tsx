import clsx from 'clsx'
import React from 'react'

import { Box } from '../../Box/Box'
import * as styles from './styles.css'

export type Props = {
	trigger?: 'row' | 'cell' | 'header'
	children: React.ReactNode
}

export const Discoverable: React.FC<Props> = ({
	children,
	trigger = 'cell',
}) => {
	return (
		<Box
			display="flex"
			cssClass={clsx(styles.discoverable, {
				[styles.rowTrigger]: trigger === 'row',
				[styles.cellTrigger]: trigger === 'cell',
				[styles.headerTrigger]: trigger === 'header',
			})}
		>
			{children}
		</Box>
	)
}
