import classNames from 'classnames'
import React from 'react'

import styles from './DataCard.module.scss'

type Props = {
	title: string | React.ReactNode
	/** Should the card span the full available width. */
	fullWidth?: boolean
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>

const DataCard: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	title,
	fullWidth = false,
	...props
}) => {
	return (
		<article
			className={classNames(styles.card, props.className, {
				[styles.fullWidth]: fullWidth,
			})}
		>
			<div className={styles.titleContainer}>
				{typeof title === 'string' ? <h2>{title}</h2> : title}
			</div>
			<main className={styles.content}>{children}</main>
		</article>
	)
}

export default DataCard
