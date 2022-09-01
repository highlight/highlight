import { LoadingBar } from '@components/Loading/Loading'
import React from 'react'

import ElevatedCard from '../../../../components/ElevatedCard/ElevatedCard'
import styles from './LoadingLiveSessionCard.module.scss'

const LoadingLiveSessionCard = () => {
	return (
		<ElevatedCard className={styles.card} title="Loading Live Session...">
			<p>
				Give us a second while we load your session. "Patience is
				bitter, but its fruit is sweet".
			</p>
			<LoadingBar width="100%" />
		</ElevatedCard>
	)
}

export default LoadingLiveSessionCard
