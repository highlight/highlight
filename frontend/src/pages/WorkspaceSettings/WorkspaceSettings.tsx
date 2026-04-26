import { Alert } from '@components/Alert/Alert'
import { AutoJoinForm } from '@pages/WorkspaceTeam/components/AutoJoinForm'
import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { useGetWorkspaceQuery } from '@graph/hooks'
import { Box, Stack } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

import { Authorization } from '@/components/Authorization/Authorization'
import { useProjectId } from '@/hooks/useProjectId'

export const WorkspaceSettings: React.FC<React.PropsWithChildren<unknown>> = ({
	children,
}) => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()
	const { projectId } = useProjectId()
	const { data, loading } = useGetWorkspaceQuery({
		variables: { workspace_id: workspace_id! },
		skip: !workspace_id,
	})

	const workspace = data?.workspace

	if (loading || !workspace) {
		return null
	}

	return (
		<Authorization
			kind="workspace"
			id={workspace.id}
			forbiddenFallback={
				<Box p="16" gap="16" direction="column">
					<Alert kind="error">
						You don’t have permission to view this workspace.
					</Alert>
				</Box>
			}
		>
			<Box p="16" gap="16" direction="column" style={{ width: '100%' }}>
				<Stack gap="16" direction="column">
					<FieldsBox title="Auto-join Projects">
						<AutoJoinForm projectId={projectId} />
					</FieldsBox>
				</Stack>
				{children}
			</Box>
		</Authorization>
	)
}