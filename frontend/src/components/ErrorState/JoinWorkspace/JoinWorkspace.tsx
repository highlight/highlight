import Button from '@components/Button/Button/Button'
import { useJoinWorkspaceMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Maybe } from '@graph/schemas'
import { message } from 'antd'
import React from 'react'

import { showSupportMessage } from '@/util/window'

const JoinWorkspace = ({
	workspace,
}: {
	workspace: Maybe<{
		id: string
		name: string
	}>
}) => {
	const [JoinWorkspace] = useJoinWorkspaceMutation()
	const workspaceID = workspace?.id
	if (!workspaceID?.length) {
		return null
	}
	return (
		<Button
			trackingId="ErrorStateJoinWorkspace"
			type="primary"
			onClick={async () => {
				try {
					await JoinWorkspace({
						variables: { workspace_id: workspaceID },
						refetchQueries: [
							namedOperations.Query.GetProjectDropdownOptions,
							namedOperations.Query.GetWorkspaceDropdownOptions,
						],
					})
				} catch (_e) {
					message.error(
						'Failed to join the workspace. Please try again or',
					)

					showSupportMessage(
						`I can't reply to a comment. This is the error I'm getting: "${_e}"`,
					)
				} finally {
					message.success(
						<>Successfully joined workspace '{workspace?.name}'!</>,
					)
				}
			}}
		>
			{`Join ${workspace?.name}`}
		</Button>
	)
}

export default JoinWorkspace
