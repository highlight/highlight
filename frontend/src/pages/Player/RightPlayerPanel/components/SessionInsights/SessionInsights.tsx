import { Box, Text } from '@highlight-run/ui'

import { useGetSessionInsightQuery } from '@/graph/generated/hooks'
import { useParams } from '@/util/react-router/useParams'

const SessionInsights = () => {
	const { session_secure_id } = useParams<{
		session_secure_id: string
	}>()

	const { data } = useGetSessionInsightQuery({
		variables: {
			secure_id: session_secure_id!,
		},
		skip: !session_secure_id,
	})

	return (
		<Box p="12" display="flex" flexDirection="column" gap="12">
			<Text size="small" weight="bold">
				Session Insights
			</Text>
			{data?.session_insight?.insight.split('\n').map((insight, idx) => (
				<Text size="xSmall" key={idx}>
					{insight}
				</Text>
			))}
		</Box>
	)
}

export default SessionInsights
