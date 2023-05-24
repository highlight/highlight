import { useAuthContext } from '@authentication/AuthContext'
import { AdminAvatar } from '@components/Avatar/Avatar'
import Card from '@components/Card/Card'
import Select from '@components/Select/Select'
import Table from '@components/Table/Table'
import {
	useChangeAdminRoleMutation,
	useDeleteAdminFromWorkspaceMutation,
	useGetWorkspaceAdminsQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { AdminRole } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import SvgTrashIcon from '@icons/TrashIcon'
import AutoJoinForm from '@pages/WorkspaceTeam/components/AutoJoinForm'
import {
	Authorization,
	useAuthorization,
} from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
import { useParams } from '@util/react-router/useParams'
import { getDisplayNameFromEmail, titleCaseString } from '@util/string'
import { message } from 'antd'
import clsx from 'clsx'
import React from 'react'
import { useToggle } from 'react-use'

import InviteMemberModal from '@/pages/WorkspaceTeam/components/InviteMemberModal'

import Button from '../../components/Button/Button/Button'
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss'
import PopConfirm from '../../components/PopConfirm/PopConfirm'
import styles from './WorkspaceTeam.module.scss'

const WorkspaceTeam = () => {
	const { workspace_id } = useParams<{ workspace_id: string }>()
	const { data, error, loading } = useGetWorkspaceAdminsQuery({
		variables: { workspace_id: workspace_id! },
		skip: !workspace_id,
	})
	const { checkPolicyAccess } = useAuthorization()
	const [showModal, toggleShowModal] = useToggle(false)

	const { admin } = useAuthContext()
	const [deleteAdminFromWorkspace] = useDeleteAdminFromWorkspaceMutation({
		update(cache, { data }) {
			cache.modify({
				fields: {
					workspace_admins(existingAdmins, { DELETE }) {
						if (data?.deleteAdminFromWorkspace !== undefined) {
							message.success('Removed member')
							return DELETE
						}
						message.success('Failed to remove member')
						return existingAdmins
					},
				},
			})
		},
	})
	const [changeAdminRole] = useChangeAdminRoleMutation()

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
				<div className={styles.membersTitleContainer}>
					<h4 className={styles.membersTitle}>All members</h4>
				</div>
				<div
					className={clsx(styles.memberCardWrapper, 'highlight-mask')}
				>
					<Card noPadding>
						<Table
							columns={
								checkPolicyAccess({
									policyName: POLICY_NAMES.RolesUpdate,
								})
									? TABLE_COLUMNS
									: TABLE_COLUMNS.slice(0, 2)
							}
							loading={loading}
							dataSource={data?.admins?.map((wa) => ({
								name: wa.admin?.name,
								email: wa.admin?.email,
								role: wa.role,
								photoUrl: wa.admin?.photo_url,
								id: wa.admin?.id,
								isSameAdmin: wa.admin?.id === admin?.id,
								onDeleteHandler: () => {
									if (!workspace_id) {
										return
									}
									deleteAdminFromWorkspace({
										variables: {
											admin_id: wa.admin!.id,
											workspace_id: workspace_id!,
										},
										refetchQueries: [
											namedOperations.Query
												.GetWorkspaceAdmins,
										],
									})
								},
								onUpdateRoleHandler: (new_role: string) => {
									changeAdminRole({
										variables: {
											admin_id: wa.admin!.id,
											workspace_id: workspace_id!,
											new_role,
										},
									})

									let messageText = ''
									const displayName =
										wa.admin?.name ||
										getDisplayNameFromEmail(
											wa.admin?.email || '',
										)
									switch (new_role) {
										case AdminRole.Admin:
											messageText = `${displayName} has been granted Admin powers 🧙`
											break
										case AdminRole.Member:
											messageText = `${displayName} no longer has admin access.`
											break
									}
									message.success(messageText)
								},
								canUpdateAdminRole: checkPolicyAccess({
									policyName: POLICY_NAMES.RolesUpdate,
								}),
							}))}
							pagination={false}
							showHeader={false}
							rowHasPadding
						/>
					</Card>
				</div>
			</Box>
		</Box>
	)
}

export default WorkspaceTeam

const TABLE_COLUMNS = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
		render: (_: string, record: any) => {
			return (
				<div className={styles.memberCard}>
					<AdminAvatar
						size={45}
						adminInfo={{
							email: record.email,
							name: record.name,
							photo_url: record.photoUrl,
						}}
					/>
					<div>
						<h4>
							{record?.name
								? record?.name
								: getDisplayNameFromEmail(record.email)}{' '}
							{record.isSameAdmin && '(You)'}
						</h4>
						<div className={styles.email}>{record?.email}</div>
					</div>
				</div>
			)
		},
	},
	{
		title: 'Role',
		dataIndex: 'role',
		key: 'role',
		render: (role: string, record: any) => {
			if (record.canUpdateAdminRole) {
				return (
					<div className={styles.role}>
						<Select
							disabled={record.isSameAdmin}
							onChange={record.onUpdateRoleHandler}
							options={(
								Object.keys(
									AdminRole,
								) as (keyof typeof AdminRole)[]
							).map((key) => {
								const role = AdminRole[key]

								return {
									displayValue: titleCaseString(role),
									id: role,
									value: role,
								}
							})}
							defaultValue={record.role}
						/>
					</div>
				)
			}
			return <div className={styles.role}>{titleCaseString(role)}</div>
		},
	},
	{
		title: 'Remove',
		dataIndex: 'remove',
		key: 'remove',
		render: (_: any, record: any) => {
			return (
				<PopConfirm
					title={`Remove ${record?.name || record?.email}?`}
					description="They will no longer have access to Highlight. You can invite them again if they need access."
					okText={`Remove ${record?.name || record?.email}`}
					cancelText="Cancel"
					onConfirm={() => {
						if (record?.onDeleteHandler) {
							record.onDeleteHandler()
						}
					}}
					okButtonProps={{ danger: true }}
				>
					<Button
						className={styles.removeTeamMemberButton}
						trackingId="RemoveTeamMember"
						// An Admin should not be able to delete themselves from an project.
						disabled={record?.isSameAdmin}
						iconButton
					>
						<SvgTrashIcon />
					</Button>
				</PopConfirm>
			)
		},
	},
]
