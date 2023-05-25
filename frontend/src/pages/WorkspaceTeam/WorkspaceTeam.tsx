import Tabs from '@components/Tabs/Tabs'
import { useGetWorkspaceAdminsQuery } from '@graph/hooks'
import { AdminRole, WorkspaceAdminRole } from '@graph/schemas'
import { Badge, Box, IconSolidUserAdd, Stack, Text } from '@highlight-run/ui'
import AllMembers from '@pages/WorkspaceTeam/components/AllMembers'
import AutoJoinForm from '@pages/WorkspaceTeam/components/AutoJoinForm'
import InviteMemberModal from '@pages/WorkspaceTeam/components/InviteMemberModal'
import PendingInvites from '@pages/WorkspaceTeam/components/PendingInvites'
import { Authorization } from '@util/authorization/authorization'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useToggle } from 'react-use'

import Button from '../../components/Button/Button/Button'
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss'
import styles from './WorkspaceTeam.module.scss'

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

	const TabContentContainer = ({ children }: { children: any }) => (
		<Box mt="8">
			<div className={styles.tabTitleContainer}>
				<h4 className={styles.tabTitle}>
					{determineTitle(member_tab_key)}
				</h4>
				<InviteMemberModal
					workspaceId={workspace_id}
					workspaceName={data?.workspace?.name}
					workspaceInviteLinks={data?.workspace_invite_links}
					showModal={showModal}
					toggleShowModal={toggleShowModal}
				/>
				<Button
					className={styles.inviteButton}
					trackingId="WorkspaceTeamInviteMember"
					type="primary"
					onClick={toggleShowModal}
					small
				>
					<IconSolidUserAdd />
					<Text>Invite users</Text>
				</Button>
			</div>
			{children}
		</Box>
	)

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
						<AutoJoinForm label="Auto join" labelFirst />
					</Authorization>
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
								<TabContentContainer>
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
							// TODO(spenny): load count
							title: (
								<TabTitle label="Pending invites (coming soon)" />
							),
							panelContent: (
								<TabContentContainer>
									<PendingInvites
										workspaceId={workspace_id}
									/>
								</TabContentContainer>
							),
							disabled: true,
						},
					]}
				/>
			</Box>
		</Box>
	)
}

const determineTitle = (key: MemberKeyType) => {
	switch (key) {
		case 'members':
			return 'All members'
		case 'invites':
			return 'Pending invites'
	}
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
