import { Box, BoxProps, Callout, Text } from '@highlight-run/ui/components'
import { useEffect } from 'react'

import { useErrorPageNavigation } from '@/pages/ErrorsV2/ErrorsV2'
import { useParams } from '@/util/react-router/useParams'
import { FeatureFlag } from '@/components/LaunchDarkly/FeatureFlag'
import { useFeatureFlag } from '@/components/LaunchDarkly/useFeatureFlag'

const cardStyleVariants: Record<string, BoxProps['color']> = {
	bad: 'bad',
	good: 'good',
	normal: 'moderate',
}

const NoActiveSessionCard = () => {
	const cardStyle = useFeatureFlag('enable-session-card-style', 'normal')
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
					<Text color={cardStyleVariants[cardStyle]}>
						<FeatureFlag
							flag="enable-session-card-text"
							enabled={<>You are receiving the new cart text!</>}
						>
							View a recent session or find a specific identifier,
							URL, or segment.
						</FeatureFlag>
					</Text>
				</Box>
			</Callout>
		</Box>
	)
}

export default NoActiveSessionCard
