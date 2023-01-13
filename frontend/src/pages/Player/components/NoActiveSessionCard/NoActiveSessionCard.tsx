import { Box, Callout, Text } from '@highlight-run/ui'
import useErrorPageConfiguration from '@pages/Error/utils/ErrorPageUIConfiguration'
import React, { useEffect } from 'react'

import styles from './NoActiveSessionCard.module.scss'

const NoActiveSessionCard = () => {
	const { setShowLeftPanel } = useErrorPageConfiguration()

	useEffect(() => {
		setShowLeftPanel(true)
	}, [setShowLeftPanel])

	return (
		<Box cssClass={styles.card}>
			<Callout title="Ready to see your app?">
				<Box
					display="flex"
					flexDirection="column"
					gap="16"
					alignItems="flex-start"
					mb="6"
				>
					<Text color="moderate">
						View a recent session or find a specific identifier,
						URL, or segment.
					</Text>
				</Box>
			</Callout>
		</Box>
	)
}

export default NoActiveSessionCard
