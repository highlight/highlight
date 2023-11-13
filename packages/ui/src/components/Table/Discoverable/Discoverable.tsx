import React from 'react'
import { Box } from '../../Box/Box'
import clsx from 'clsx'

import * as styles from './styles.css'

export type Props = {
	trigger?: 'row' | 'cell'
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
			})}
		>
			{children}
		</Box>
	)
}
