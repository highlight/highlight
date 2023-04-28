import clsx from 'clsx'
import React, { PropsWithChildren } from 'react'

import styles from './ElevatedCard.module.scss'

interface Props {
	title?: string | React.ReactNode
	animation?: React.ReactNode
	/** Buttons or action elements for the card. These are rendered at the bottom of the card. */
	actions?: React.ReactNode
	className?: string
}

const ElevatedCard = ({
	title,
	children,
	animation,
	actions,
	className,
}: PropsWithChildren<Props>) => {
	return (
		<div
			className={clsx(
				styles.card,
				{
					[styles.center]: !!animation,
				},
				className,
			)}
		>
			{animation && <div className={styles.animation}>{animation}</div>}
			{title && <h2>{title}</h2>}
			<div className={styles.content}>{children}</div>
			{actions && <div className={styles.actions}>{actions}</div>}
		</div>
	)
}

export default ElevatedCard
