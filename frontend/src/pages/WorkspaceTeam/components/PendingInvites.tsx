import { useAuthContext } from '@authentication/AuthContext'
import { AdminAvatar } from '@components/Avatar/Avatar'
import Card from '@components/Card/Card'
import Table from '@components/Table/Table'
import {
	useDeleteAdminFromWorkspaceMutation,
	useGetWorkspacePendingInvitesQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { WorkspaceAdminRole } from '@graph/schemas'
import SvgTrashIcon from '@icons/TrashIcon'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
import { message } from 'antd'
import clsx from 'clsx'
import React from 'react'

import Button from '../../../components/Button/Button/Button'
import PopConfirm from '../../../components/PopConfirm/PopConfirm'
import styles from './AllMembers.module.scss'

const PendingInvites = ({ workspaceId }: { workspaceId?: string }) => {
	const { checkPolicyAccess } = useAuthorization()
	// TODO(spenny): make request for pending invites
	const { data, loading, error } = useGetWorkspacePendingInvitesQuery({
		variables: { workspace_id: workspaceId! },
		skip: !workspaceId,
	})

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

	return (
		<div className={clsx(styles.memberCardWrapper, 'highlight-mask')}>
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
					dataSource={data?.invites?.map(
						(wa: WorkspaceAdminRole) => ({
							name: wa.admin?.name,
							email: wa.admin?.email,
							role: wa.role,
							photoUrl: wa.admin?.photo_url,
							id: wa.admin?.id,
							isSameAdmin: wa.admin?.id === admin?.id,
							onDeleteHandler: () => {
								if (!workspaceId) {
									return
								}
								deleteAdminFromWorkspace({
									variables: {
										admin_id: wa.admin!.id,
										workspace_id: workspaceId!,
									},
									refetchQueries: [
										namedOperations.Query
											.GetWorkspaceAdmins,
									],
								})
							},
							canUpdateAdminRole: checkPolicyAccess({
								policyName: POLICY_NAMES.RolesUpdate,
							}),
						}),
					)}
					pagination={false}
					showHeader={false}
					rowHasPadding
				/>
			</Card>
		</div>
	)
}

export default PendingInvites

const TABLE_COLUMNS = [
	{
		title: 'Email',
		dataIndex: 'email',
		key: 'email',
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
						<h4>{record?.email}</h4>
						<div className={styles.email}>
							{record?.relativeTime}
						</div>
					</div>
				</div>
			)
		},
	},
	{
		title: 'Remove',
		dataIndex: 'remove',
		key: 'remove',
		render: (_: any, record: any) => {
			return (
				<PopConfirm
					title={`Remove ${record?.email}?`}
					description="They will no longer have access to Highlight. You can invite them again if they need access."
					okText={`Remove ${record?.email}`}
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
