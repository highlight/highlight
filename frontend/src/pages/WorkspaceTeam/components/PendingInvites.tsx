import { AdminAvatar } from '@components/Avatar/Avatar'
import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import PopConfirm from '@components/PopConfirm/PopConfirm'
import Table from '@components/Table/Table'
import { toast } from '@components/Toaster'
import {
	useDeleteInviteLinkFromWorkspaceMutation,
	useGetWorkspacePendingInvitesQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Box } from '@highlight-run/ui/components'
import SvgTrashIconSolid from '@icons/TrashIconSolid'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
import { titleCaseString } from '@util/string'
import clsx from 'clsx'
import moment from 'moment'
import React from 'react'

import styles from './PendingInvites.module.css'

interface Props {
	workspaceId?: string
	active: boolean
	shouldRefetchData: boolean
}

const PendingInvites = ({ workspaceId, active, shouldRefetchData }: Props) => {
	const { checkPolicyAccess } = useAuthorization()
	const { data, loading, error, refetch } =
		useGetWorkspacePendingInvitesQuery({
			variables: { workspace_id: workspaceId! },
			skip: !workspaceId,
		})
	const { workspacePendingInvites = [] } = data || {}
	const [deleteInviteLinkFromWorkspace] =
		useDeleteInviteLinkFromWorkspaceMutation({
			update(cache, { data }) {
				cache.modify({
					fields: {
						workspace_pending_invites(existingInvites, { DELETE }) {
							if (data?.deleteInviteLinkFromWorkspace) {
								toast.success('Deleted invite')
								return DELETE
							}
							toast.success('Failed to delete invite')
							return existingInvites
						},
					},
				})
			},
		})

	React.useEffect(() => {
		if (active && shouldRefetchData) {
			refetch({ workspace_id: workspaceId! })
		}
	}, [active, shouldRefetchData, refetch, workspaceId])

	if (error) {
		return <div>{JSON.stringify(error)}</div>
	}

	return (
		<div className={clsx(styles.inviteCardWrapper, 'highlight-mask')}>
			<Card noPadding>
				{!loading && workspacePendingInvites.length == 0 ? (
					<Box p="16" display="flex" justifyContent="center">
						You currently do not have any pending invites.
					</Box>
				) : (
					<Table
						columns={
							checkPolicyAccess({
								policyName: POLICY_NAMES.RolesUpdate,
							})
								? TABLE_COLUMNS
								: TABLE_COLUMNS.slice(0, 2)
						}
						loading={loading}
						dataSource={workspacePendingInvites.map((invite) => ({
							email: invite?.invitee_email,
							creationDate: invite?.created_at,
							id: invite?.id,
							role: invite?.invitee_role,
							onDeleteHandler: () => {
								if (!workspaceId) {
									return
								}

								deleteInviteLinkFromWorkspace({
									variables: {
										workspace_invite_link_id: invite!.id,
										workspace_id: workspaceId!,
									},
									refetchQueries: [
										namedOperations.Query
											.GetWorkspacePendingInvites,
									],
								})
							},
						}))}
						pagination={false}
						showHeader={false}
						rowHasPadding
					/>
				)}
			</Card>
		</div>
	)
}

const TABLE_COLUMNS = [
	{
		title: 'Email',
		dataIndex: 'email',
		key: 'email',
		render: (_: string, record: any) => {
			return (
				<div className={styles.inviteCard}>
					<AdminAvatar
						size={45}
						adminInfo={{
							email: record.email,
						}}
					/>
					<div>
						<h4>{record?.email}</h4>
						<div className={styles.inviteTime}>
							{moment(record?.creationDate).fromNow()}
						</div>
					</div>
				</div>
			)
		},
	},
	{
		title: 'Role',
		dataIndex: 'role',
		key: 'role',
		render: (role: string, _: any) => {
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
					title={`Delete invite for ${record?.email}?`}
					description="Their invite link will no longer be active. You can invite them again if they need access."
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
						trackingId="DeleteInvite"
						iconButton
					>
						<SvgTrashIconSolid />
					</Button>
				</PopConfirm>
			)
		},
	},
]

export { PendingInvites }
