import { Box, Callout, Text } from '@highlight-run/ui/components'
import { useEffect } from 'react'

import { useErrorPageNavigation } from '@/pages/ErrorsV2/ErrorsV2'
import { useParams } from '@/util/react-router/useParams'

const NoActiveSessionCard = () => {
	const { setShowLeftPanel } = useErrorPageNavigation()
	const { session_secure_id } = useParams<{
		session_secure_id: string
	}>()

	useEffect(() => {
		if (!session_secure_id) {
			setShowLeftPanel(true)
		}
	}, [session_secure_id, setShowLeftPanel])

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
