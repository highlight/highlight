import { Button } from '@components/Button'
import Tabs from '@components/Tabs/Tabs'
import { useGetWorkspaceAdminsQuery } from '@graph/hooks'
import { AdminRole, WorkspaceAdminRole } from '@graph/schemas'
import {
	Badge,
	Box,
	IconSolidUserAdd,
	Stack,
} from '@highlight-run/ui/components'
import AllMembers from '@pages/WorkspaceTeam/components/AllMembers'
import AutoJoinForm from '@pages/WorkspaceTeam/components/AutoJoinForm'
import InviteMemberModal from '@pages/WorkspaceTeam/components/InviteMemberModal'
import { PendingInvites } from '@pages/WorkspaceTeam/components/PendingInvites'
import { Authorization } from '@util/authorization/authorization'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useToggle } from 'react-use'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'
import styles from './WorkspaceTeam.module.css'

type MemberKeyType = 'members' | 'invites'

const WorkspaceTeam = () => {
	const { workspace_id, member_tab_key = 'members' } = useParams<{
		workspace_id: string
		member_tab_key?: MemberKeyType
	}>()
	const { data, error, loading } = useGetWorkspaceAdminsQuery({
		variables: { workspace_id: workspace_id! },
		skip: !workspace_id,
	})
	const navigate = useNavigate()
	const [showModal, toggleShowModal] = useToggle(false)

	if (error) {
		return <div>{JSON.stringify(error)}</div>
	}

	return (
		<Box>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<div className={styles.titleContainer}>
					<h3>Members</h3>
					<p className={layoutStyles.subTitle}>
						Invite new users to your workspace or manage their
						roles!
					</p>
					<Authorization allowedRoles={[AdminRole.Admin]}>
						<AutoJoinForm
							label="Auto join"
							labelFirst
							allowedEmailOrigins={
								data?.workspace?.allowed_auto_join_email_origins
									?.length
									? JSON.parse(
											data?.workspace
												?.allowed_auto_join_email_origins,
									  )
									: undefined
							}
						/>
					</Authorization>
					<InviteMemberModal
						workspaceId={workspace_id}
						workspaceName={data?.workspace?.name}
						workspaceInviteLinks={data?.workspace_invite_links}
						showModal={showModal}
						toggleShowModal={toggleShowModal}
					/>
				</div>
				<Tabs
					animated={false}
					id="memberTabs"
					className={styles.teamTabs}
					noHeaderPadding
					noPadding
					unsetOverflowY
					activeKeyOverride={member_tab_key}
					onChange={(activeKey) =>
						navigate(`/w/${workspace_id}/team/${activeKey}`)
					}
					tabs={[
						{
							key: 'members',
							title: <TabTitle label="Members" />,
							panelContent: (
								<TabContentContainer
									title="All members"
									toggleInviteModal={toggleShowModal}
								>
									<AllMembers
										workspaceId={workspace_id}
										admins={
											data?.admins as WorkspaceAdminRole[]
										}
										loading={loading}
									/>
								</TabContentContainer>
							),
						},
						{
							key: 'invites',
							title: <TabTitle label="Pending invites" />,
							panelContent: (
								<TabContentContainer
									title="Pending invites"
									toggleInviteModal={toggleShowModal}
								>
									<PendingInvites
										workspaceId={workspace_id}
										active={member_tab_key === 'invites'}
										shouldRefetchData={!showModal}
									/>
								</TabContentContainer>
							),
						},
					]}
				/>
			</Box>
		</Box>
	)
}

const TabContentContainer = ({
	children,
	title,
	toggleInviteModal,
}: {
	children: any
	title: string
	toggleInviteModal: any
}) => {
	return (
		<Box mt="8">
			<Stack
				mb="8"
				align="center"
				justify="space-between"
				direction="row"
			>
				<h4 className={styles.tabTitle}>{title}</h4>
				<Button
					trackingId="WorkspaceTeamInviteMember"
					iconLeft={<IconSolidUserAdd />}
					onClick={toggleInviteModal}
				>
					Invite users
				</Button>
			</Stack>
			{children}
		</Box>
	)
}

type TabTitleProps = {
	label: string
	count?: number
}

const TabTitle: React.FC<TabTitleProps> = ({ label, count }) => {
	return (
		<Box px="6">
			<Stack direction="row" gap="6" align="center">
				{label}
				{count && (
					<Badge
						variant="gray"
						size="small"
						label={count.toString()}
					/>
				)}
			</Stack>
		</Box>
	)
}

export default WorkspaceTeam
