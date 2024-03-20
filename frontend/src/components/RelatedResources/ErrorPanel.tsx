import { Box } from '@highlight-run/ui/components'
import { useMemo, useState } from 'react'

import { Divider } from '@/components/CreateAlertButton/CreateAlertButton'
import LoadingBox from '@/components/LoadingBox'
import { RelatedError } from '@/components/RelatedResources/hooks'
import { Panel } from '@/components/RelatedResources/Panel'
import { useGetErrorInstanceQuery } from '@/graph/generated/hooks'
import { useNumericProjectId } from '@/hooks/useProjectId'
import ErrorBody from '@/pages/ErrorsV2/ErrorBody/ErrorBody'
import {
	ErrorInstanceBody,
	ErrorInstanceInfo,
	ErrorInstanceStackTrace,
} from '@/pages/ErrorsV2/ErrorInstance/ErrorInstance'
import ErrorIssueButton from '@/pages/ErrorsV2/ErrorIssueButton/ErrorIssueButton'
import ErrorShareButton from '@/pages/ErrorsV2/ErrorShareButton/ErrorShareButton'
import { ErrorStateSelect } from '@/pages/ErrorsV2/ErrorStateSelect/ErrorStateSelect'
import { useErrorGroup } from '@/pages/ErrorsV2/ErrorsV2'
import ErrorTitle from '@/pages/ErrorsV2/ErrorTitle/ErrorTitle'
import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'

export const ErrorPanel: React.FC<{ resource: RelatedError }> = ({
	resource,
}) => {
	const [displayGitHubSettings, setDisplayGitHubSettings] = useState(false)
	const { projectId } = useNumericProjectId()
	const path = useMemo(
		() =>
			`/${projectId}/errors/${resource.id}/instances/${resource.instanceId}?${PlayerSearchParameters.search}=false`,
		[projectId, resource.id, resource.instanceId],
	)
	const { data, loading } = useErrorGroup(resource.id)
	const errorGroup = data?.error_group
	const { data: errorInstanceData, loading: errorInstanceLoading } =
		useGetErrorInstanceQuery({
			variables: {
				error_group_secure_id: String(errorGroup?.secure_id),
				error_object_id: String(resource.instanceId),
			},
			skip: !resource.instanceId,
		})
	const errorInstance = errorInstanceData?.error_instance
	const showLoading =
		loading || errorInstanceLoading || !errorGroup || !errorInstance

	return (
		<>
			<Panel.Header path={path}>
				{!showLoading && (
					<>
						<ErrorShareButton errorGroup={errorGroup} />
						<ErrorStateSelect
							errorSecureId={errorGroup.secure_id}
							state={errorGroup.state}
							snoozedUntil={errorGroup.snoozed_until}
						/>
						<Divider />
						<ErrorIssueButton errorGroup={errorGroup} />
					</>
				)}
			</Panel.Header>

			{showLoading ? (
				<LoadingBox />
			) : (
				<Box overflowY="scroll" width="full">
					<Box py="28" px="36" mx="auto" style={{ maxWidth: 940 }}>
						<ErrorTitle errorGroup={errorGroup} />
						<ErrorBody errorGroup={errorGroup} />

						<Box mt="32">
							<ErrorInstanceBody errorInstance={errorInstance} />
						</Box>

						<ErrorInstanceInfo
							errorGroup={errorGroup}
							errorInstance={errorInstance}
						/>
						<ErrorInstanceStackTrace
							displayGitHubSettings={displayGitHubSettings}
							errorInstance={errorInstance}
							setDisplayGitHubSettings={setDisplayGitHubSettings}
						/>
					</Box>
				</Box>
			)}
		</>
	)
}
