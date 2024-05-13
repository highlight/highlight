import clsx from 'clsx'
import React, { forwardRef } from 'react'

import { Text } from '../../../components/Text/Text'
import { Box } from '../../Box/Box'
import * as styles from './styles.css'

export type Props = {
	children?: React.ReactNode
	noPadding?: boolean
}

export const Header = forwardRef<HTMLDivElement, Props>(
	({ children, noPadding }, ref) => {
		return (
			<Box
				cssClass={clsx(styles.header, {
					[styles.noPadding]: noPadding,
				})}
				ref={ref}
			>
				<Text size="xSmall">{children}</Text>
			</Box>
		)
	},
)
