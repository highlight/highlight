import { Box, Callout, Text } from '@highlight-run/ui/components'
import useErrorPageConfiguration from '@pages/ErrorsV2/utils/ErrorPageUIConfiguration'
import React, { useEffect } from 'react'

import styles from './NoActiveErrorCard.module.css'

const NoActiveErrorCard = () => {
	const { setShowLeftPanel } = useErrorPageConfiguration()

	useEffect(() => {
		setShowLeftPanel(true)
	}, [setShowLeftPanel])

	return (
		<Box cssClass={styles.card}>
			<Callout title="Let's squash some bugs!">
				<Box
					display="flex"
					flexDirection="column"
					gap="16"
					alignItems="flex-start"
					mb="6"
				>
					<Text color="moderate">
						View a recent error or find a specific error message,
						URL, or segment.
					</Text>
				</Box>
			</Callout>
		</Box>
	)
}

export default NoActiveErrorCard
