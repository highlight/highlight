import { useSyncSlackIntegrationMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useProjectId } from '@hooks/useProjectId'
import { useState } from 'react'

export function useSlackSync() {
	const [slackLoading, setSlackLoading] = useState(false)
	const { projectId } = useProjectId()

	const [syncSlackIntegration] = useSyncSlackIntegrationMutation({
		variables: {
			project_id: projectId,
		},
		refetchQueries: [
			namedOperations.Query.GetAlertsPagePayload,
			namedOperations.Query.GetCommentMentionSuggestions,
		],
	})

	const syncSlack = async () => {
		setSlackLoading(true)
		await syncSlackIntegration()
		setSlackLoading(false)
	}

	return {
		slackLoading,
		syncSlack,
	}
}
