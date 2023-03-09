import { Box } from '@highlight-run/ui'
import clsx from 'clsx'
import React from 'react'

import styles from './LeadAlignLayout.module.scss'

interface Props {
	fullWidth?: boolean
	maxWidth?: number
}

const LeadAlignLayout: React.FC<
	React.PropsWithChildren<Props & { className?: string }>
> = ({ fullWidth = false, maxWidth, children, className }) => {
	return (
		<Box
			width="full"
			display="flex"
			borderTop="dividerWeak"
			justifyContent="center"
		>
			<main
				className={clsx(className, styles.leadAlignLayout, {
					[styles.fullWidth]: fullWidth,
				})}
				style={{ maxWidth: maxWidth }}
			>
				{children}
			</main>
		</Box>
	)
}

export default LeadAlignLayout
