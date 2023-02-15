import clsx from 'clsx'
import React from 'react'

import { ReactComponent as EmptyState } from '../../../../static/empty-state.svg'
import styles from './EmptyCardPlaceholder.module.scss'

interface Props {
	title?: string
	message?: string | React.ReactNode
	compact?: boolean
}

const EmptyCardPlaceholder = ({ message, title, compact }: Props) => {
	return (
		<div className={styles.emptyCardPlaceholder}>
			<div
				className={clsx(styles.graphicContainer, {
					[styles.compact]: compact,
				})}
			>
				<EmptyState
					height={30}
					width={220}
					preserveAspectRatio="xMinYMin"
				/>
			</div>

			<h3>{title || 'No data yet'}</h3>
			<p>
				{message ||
					'Your data will show up here as Highlight records sessions.'}
			</p>
		</div>
	)
}

export default EmptyCardPlaceholder
