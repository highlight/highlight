import { Button } from '@components/Button'
import { useGetWorkspaceAdminsQuery } from '@graph/hooks'
import { AdminRole, Project, WorkspaceAdminRole } from '@graph/schemas'
import {
	Box,
	IconSolidUserAdd,
	Stack,
	Tabs,
} from '@highlight-run/ui/components'
import AllMembers from '@pages/WorkspaceTeam/components/AllMembers'
import { AutoJoinForm } from '@pages/WorkspaceTeam/components/AutoJoinForm'
import InviteMemberModal from '@pages/WorkspaceTeam/components/InviteMemberModal'
import { PendingInvites } from '@pages/WorkspaceTeam/components/PendingInvites'
import { Authorization } from '@util/authorization/authorization'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useToggle } from 'react-use'

import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'
import styles from './WorkspaceTeam.module.css'

enum MemberKeyType {
	Members = 'members',
	Invites = 'invites',
}

const WorkspaceTeam = () => {
	const { workspace_id, member_tab_key = MemberKeyType.Members } = useParams<{
		workspace_id: string
		member_tab_key?: MemberKeyType
	}>()
	const {
		data,
		error,
		loading: adminsLoading,
	} = useGetWorkspaceAdminsQuery({
		variables: { workspace_id: workspace_id! },
		skip: !workspace_id,
	})
	const { allProjects, loading: appLoading } = useApplicationContext()
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
						<AutoJoinForm />
					</Authorization>
					<InviteMemberModal
						workspaceId={workspace_id}
						workspaceName={data?.workspace?.name}
						workspaceInviteLinks={data?.workspace_invite_links}
						showModal={showModal}
						toggleShowModal={toggleShowModal}
					/>
				</div>

				<Tabs<MemberKeyType>
					selectedId={member_tab_key}
					onChange={(id) => {
						navigate(`/w/${workspace_id}/team/${id}`)
					}}
				>
					<Tabs.List>
						<Tabs.Tab id={MemberKeyType.Members}>Members</Tabs.Tab>
						<Tabs.Tab id={MemberKeyType.Invites}>
							Pending invites
						</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel id={MemberKeyType.Members}>
						<TabContentContainer
							title="All members"
							toggleInviteModal={toggleShowModal}
						>
							<AllMembers
								workspaceId={workspace_id}
								admins={data?.admins as WorkspaceAdminRole[]}
								projects={allProjects as Project[]}
								loading={adminsLoading || appLoading}
							/>
						</TabContentContainer>
					</Tabs.Panel>
					<Tabs.Panel id={MemberKeyType.Invites}>
						<TabContentContainer
							title="Pending invites"
							toggleInviteModal={toggleShowModal}
						>
							<PendingInvites
								workspaceId={workspace_id}
								active={
									member_tab_key === MemberKeyType.Invites
								}
								shouldRefetchData={!showModal}
							/>
						</TabContentContainer>
					</Tabs.Panel>
				</Tabs>
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

export default WorkspaceTeam
