import { Box, Callout, Text } from '@highlight-run/ui'

import LoadingBox from '@/components/LoadingBox'
import { useGetErrorGroupsOpenSearchQuery } from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import { ErrorFeedCard } from '@/pages/ErrorsV2/ErrorFeedCard/ErrorFeedCard'
import { FullScreenContainer } from '@/pages/LogsPage/LogsTable/FullScreenContainer'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@/pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@/pages/Player/ReplayerContext'
import {
	getHighlightRequestId,
	NetworkResource,
} from '@/pages/Player/Toolbar/DevToolsWindowV2/utils'

export const NetworkResourceErrors: React.FC<{
	resource: NetworkResource
	hide: () => void
}> = ({ resource, hide }) => {
	const { projectId } = useProjectId()
	const { errors: sessionErrors } = useReplayerContext()
	const requestId = getHighlightRequestId(resource)
	const errors = sessionErrors.filter((e) => e.request_id === requestId)
	const errorGroupSecureIds = errors.map((e) => e.error_group_secure_id)
	const { data, loading } = useGetErrorGroupsOpenSearchQuery({
		variables: {
			query: `{
				"bool": {
					"must": {
						"terms": {
							"secure_id.keyword": [${errorGroupSecureIds.map((id) => `"${id}"`).join(',')}]
						}
					}
				}
			}`.replace(/\s+/g, ''),
			project_id: projectId,
			count: errorGroupSecureIds.length,
		},
		skip: errors.length === 0,
	})

	const { setActiveError, setRightPanelView } = usePlayerUIContext()
	const { setShowRightPanel } = usePlayerConfiguration()

	return (
		<>
			{data?.error_groups_opensearch.error_groups?.length ? (
				data?.error_groups_opensearch.error_groups.map(
					(errorGroup, idx) => (
						<Box
							py="8"
							px="12"
							flex="stretch"
							justifyContent="stretch"
							display="flex"
							key={idx}
						>
							<ErrorFeedCard
								errorGroup={errorGroup}
								onClick={() => {
									const error = errors.find(
										(e) =>
											e.error_group_secure_id ===
											errorGroup.secure_id,
									)
									setActiveError(error)
									setShowRightPanel(true)
									setRightPanelView(RightPanelView.Error)
									hide()
								}}
							/>
						</Box>
					),
				)
			) : loading ? (
				<LoadingBox />
			) : (
				<FullScreenContainer>
					<Box style={{ maxWidth: 300 }}>
						<Callout title="No errors">
							<Box mb="6">
								<Text>
									There are no errors associated with this
									network request.
								</Text>
							</Box>
						</Callout>
					</Box>
				</FullScreenContainer>
			)}
		</>
	)
}
