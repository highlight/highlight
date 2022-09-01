import React from 'react'

import { ReactComponent as EmptyState } from '../../../../static/empty-state.svg'
import styles from './EmptyCardPlaceholder.module.scss'

interface Props {
	title?: string
	message?: string | React.ReactNode
}

const EmptyCardPlaceholder = ({ message, title }: Props) => {
	return (
		<div className={styles.emptyCardPlaceholder}>
			<div className={styles.graphicContainer}>
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
