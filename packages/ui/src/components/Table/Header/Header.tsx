import React from 'react'
import clsx from 'clsx'

import { Text } from '../../../components/Text/Text'
import { Box } from '../../Box/Box'
import * as styles from './styles.css'

export type Props = {
	children?: React.ReactNode
	noPadding?: boolean
}

export const Header: React.FC<Props> = ({ children, noPadding }) => {
	return (
		<Box
			cssClass={clsx(styles.header, {
				[styles.noPadding]: noPadding,
			})}
		>
			<Text size="xSmall">{children}</Text>
		</Box>
	)
}
