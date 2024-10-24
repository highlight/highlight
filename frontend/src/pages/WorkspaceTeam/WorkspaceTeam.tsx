import EnterpriseFeatureButton from '@components/Billing/EnterpriseFeatureButton'
import { Button } from '@components/Button'
import { useGetWorkspaceAdminsQuery } from '@graph/hooks'
import { AdminRole, Project, WorkspaceAdminRole } from '@graph/schemas'
import {
	Box,
	IconSolidUserAdd,
	Stack,
	Tabs,
	Tooltip,
} from '@highlight-run/ui/components'
import { useAuthContext } from '@/authentication/AuthContext'
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
					{showModal ? (
						<InviteMemberModal
							workspaceId={workspace_id}
							workspaceName={data?.workspace?.name}
							workspaceInviteLinks={data?.workspace_invite_links}
							toggleShowModal={toggleShowModal}
						/>
					) : null}
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
	toggleInviteModal: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	const { workspaceRole } = useAuthContext()

	const isAdminUser = workspaceRole === AdminRole.Admin

	return (
		<Box mt="8">
			<Stack
				mb="8"
				align="center"
				justify="space-between"
				direction="row"
			>
				<h4 className={styles.tabTitle}>{title}</h4>
				<Tooltip
					disabled={isAdminUser}
					trigger={
						<EnterpriseFeatureButton
							setting="enable_business_seats"
							name="More than 15 team members"
							fn={() => toggleInviteModal((shown) => !shown)}
							disabled={!isAdminUser}
							variant="basic"
						>
							<Button
								trackingId="WorkspaceTeamInviteMember"
								iconLeft={<IconSolidUserAdd />}
								onClick={() => null}
								disabled={!isAdminUser}
							>
								Invite users
							</Button>
						</EnterpriseFeatureButton>
					}
				>
					Please contact an admin to invite users
				</Tooltip>
			</Stack>
			{children}
		</Box>
	)
}

export default WorkspaceTeam
