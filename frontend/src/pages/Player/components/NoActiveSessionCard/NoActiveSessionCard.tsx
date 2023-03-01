import { Box, Callout, Text } from '@highlight-run/ui'
import React, { useEffect } from 'react'
import useErrorPageConfiguration from '@pages/ErrorsV2/utils/ErrorPageUIConfiguration'

const NoActiveSessionCard = () => {
	const { setShowLeftPanel } = useErrorPageConfiguration()

	useEffect(() => {
		setShowLeftPanel(true)
	}, [setShowLeftPanel])

	return (
		<Box margin="auto" style={{ maxWidth: 300 }}>
			<Callout title="Ready to see your app?">
				<Box mb="6">
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
