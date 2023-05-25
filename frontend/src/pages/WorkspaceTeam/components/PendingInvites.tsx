import { AdminAvatar } from '@components/Avatar/Avatar'
import Card from '@components/Card/Card'
import Table from '@components/Table/Table'
import { useGetWorkspacePendingInvitesQuery } from '@graph/hooks'
import SvgTrashIcon from '@icons/TrashIcon'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
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

	if (error) {
		return <div>{JSON.stringify(error)}</div>
	}

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
					dataSource={data?.workspace_pending_invites?.map(
						(invite) => ({
							email: invite.invitee_email,
							expirationDate: invite.expiration_date,
							id: invite.id,
							onDeleteHandler: () => null,
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

// TODO(spenny): update styles
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
						}}
					/>
					<div>
						<h4>{record?.email}</h4>
						<div className={styles.email}>
							{record?.expirationDate}
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
						<SvgTrashIcon />
					</Button>
				</PopConfirm>
			)
		},
	},
]

export { PendingInvites }
