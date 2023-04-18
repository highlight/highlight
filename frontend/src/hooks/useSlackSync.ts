import { useSyncSlackIntegrationMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useProjectId } from '@hooks/useProjectId'
import { throttle } from 'lodash'
import { useCallback, useState } from 'react'

export function useSlackSync() {
	const [slackLoading, setSlackLoading] = useState(false)
	const { projectId } = useProjectId()

	const [syncSlackIntegration] = useSyncSlackIntegrationMutation({
		variables: {
			project_id: projectId,
		},
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})

	// throttle the slack refresh so that we don't
	// hit the rate limit of ~20/min
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const syncSlackThrottle = useCallback(
		throttle(
			async () => {
				await syncSlackIntegration()
				setSlackLoading(false)
			},
			3000,
			{ leading: true },
		),
		[],
	)

	const syncSlack = () => {
		setSlackLoading(true)
		syncSlackThrottle()
	}

	return {
		slackLoading,
		syncSlack,
	}
}
