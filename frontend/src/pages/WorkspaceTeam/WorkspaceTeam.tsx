import { useGetWorkspaceAdminsQuery } from '@graph/hooks'
import { AdminRole, WorkspaceAdminRole } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import AllMembers from '@pages/WorkspaceTeam/components/AllMembers'
import AutoJoinForm from '@pages/WorkspaceTeam/components/AutoJoinForm'
import InviteMemberModal from '@pages/WorkspaceTeam/components/InviteMemberModal'
import { Authorization } from '@util/authorization/authorization'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { useToggle } from 'react-use'

import Button from '../../components/Button/Button/Button'
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss'
import styles from './WorkspaceTeam.module.scss'

const WorkspaceTeam = () => {
	const { workspace_id } = useParams<{ workspace_id: string }>()
	const { data, error, loading } = useGetWorkspaceAdminsQuery({
		variables: { workspace_id: workspace_id! },
		skip: !workspace_id,
	})
	const [showModal, toggleShowModal] = useToggle(false)

	if (error) {
		return <div>{JSON.stringify(error)}</div>
	}

	return (
		<Box>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<div className={styles.titleContainer}>
					<div>
						<h3>User management</h3>
						<p className={layoutStyles.subTitle}>
							Invite new users to your workspace or manage their
							roles!
						</p>
						<Authorization allowedRoles={[AdminRole.Admin]}>
							<AutoJoinForm label="Auto join" labelFirst />
						</Authorization>
					</div>
					<InviteMemberModal
						workspaceId={workspace_id}
						workspaceName={data?.workspace?.name}
						workspaceInviteLinks={data?.workspace_invite_links}
						showModal={showModal}
						toggleShowModal={toggleShowModal}
					/>
					<Button
						trackingId="WorkspaceTeamInviteMember"
						type="primary"
						onClick={toggleShowModal}
					>
						Invite Member
					</Button>
				</div>
				<AllMembers
					workspaceId={workspace_id}
					admins={data?.admins as WorkspaceAdminRole[]}
					loading={loading}
				/>
			</Box>
		</Box>
	)
}

export default WorkspaceTeam
