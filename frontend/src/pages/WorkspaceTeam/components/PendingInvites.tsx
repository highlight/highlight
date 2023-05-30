import { AdminAvatar } from '@components/Avatar/Avatar'
import Card from '@components/Card/Card'
import Table from '@components/Table/Table'
import { useGetWorkspacePendingInvitesQuery } from '@graph/hooks'
import { Box } from '@highlight-run/ui'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
import { titleCaseString } from '@util/string'
import clsx from 'clsx'
import moment from 'moment'
import React from 'react'

import styles from './PendingInvites.module.scss'

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

// TODO(spenny): add delete invite button and functionality
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
]

export { PendingInvites }
