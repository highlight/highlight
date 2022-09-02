import React from 'react'

import ElevatedCard from '../ElevatedCard/ElevatedCard'
import styles from './FullBleedCard.module.scss'

interface Props {
	title: string
	/** A Lottie component with the animation. */
	animation?: React.ReactNode
}

const FullBleedCard: React.FC<React.PropsWithChildren<Props>> = ({
	animation,
	title,
	children,
}) => {
	return (
		<div className={styles.fullBleedCard}>
			<ElevatedCard title={title} animation={animation}>
				{children}
			</ElevatedCard>
		</div>
	)
}

export default FullBleedCard
