import { Box } from '@highlight-run/ui'
import clsx from 'clsx'
import React, { PropsWithChildren } from 'react'

import styles from './ElevatedCard.module.scss'

interface Props {
	title?: string | React.ReactNode
	animation?: React.ReactNode
	/** Buttons or action elements for the card. These are rendered at the bottom of the card. */
	actions?: React.ReactNode
	className?: string
	icon?: React.ReactNode
}

const ElevatedCard = ({
	title,
	children,
	animation,
	actions,
	className,
	icon = null,
}: PropsWithChildren<Props>) => {
	return (
		<Box
			className={clsx(
				styles.card,
				{
					[styles.center]: !!animation,
				},
				className,
			)}
		>
			{animation && <Box className={styles.animation}>{animation}</Box>}
			{icon && <Box>{icon}</Box>}
			{title && <h2>{title}</h2>}
			<Box className={styles.content}>{children}</Box>
			{actions && <Box className={styles.actions}>{actions}</Box>}
		</Box>
	)
}

export default ElevatedCard
