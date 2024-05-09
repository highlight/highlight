import { useAuthContext } from '@authentication/AuthContext'
import { AdminAvatar } from '@components/Avatar/Avatar'
import Select from '@components/Select/Select'
import {
	useChangeAdminRoleMutation,
	useDeleteAdminFromWorkspaceMutation,
} from '@graph/hooks'
import { AdminRole, WorkspaceAdminRole } from '@graph/schemas'
import { Stack, Table, Text } from '@highlight-run/ui/components'
import SvgTrashIconSolid from '@icons/TrashIconSolid'
import { useAuthorization } from '@util/authorization/authorization'
import { getDisplayNameFromEmail, titleCaseString } from '@util/string'
import { message } from 'antd'

import Button from '../../../components/Button/Button/Button'
import PopConfirm from '../../../components/PopConfirm/PopConfirm'
import styles from './AllMembers.module.css'

const AllMembers = ({
	workspaceId,
	admins,
	loading,
}: {
	workspaceId?: string
	admins?: WorkspaceAdminRole[]
	loading: boolean
}) => {
	const { checkPolicyAccess } = useAuthorization()

	const { admin: self } = useAuthContext()
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

	return (
		<Table>
			<Table.Head>
				<Table.Row>
					<Table.Header>User</Table.Header>
					<Table.Header>Project Access</Table.Header>
					<Table.Header>Role</Table.Header>
				</Table.Row>
			</Table.Head>
			<Table.Body>
				{admins?.map((wa) => {
					const admin = wa.admin
					const role = wa.role
					return (
						<Table.Row key={admin.id}>
							<Table.Cell>
								<Stack
									direction="row"
									gap="6"
									alignItems="center"
								>
									<AdminAvatar
										size={20}
										adminInfo={{
											email: admin.email,
											name: admin.name,
											photo_url: admin.photo_url,
										}}
									/>
									<Stack gap="4">
										<Text lines="1">
											{admin?.name
												? admin?.name
												: getDisplayNameFromEmail(
														admin.email,
												  )}{' '}
											{self?.id === admin.id && '(You)'}
										</Text>
									</Stack>
								</Stack>
							</Table.Cell>
						</Table.Row>
					)
				})}
			</Table.Body>
		</Table>
	)

	// return (
	// 	<div className={clsx(styles.memberCardWrapper, 'highlight-mask')}>
	// 		<Card noPadding>
	// 			<Table
	// 				columns={
	// 					checkPolicyAccess({
	// 						policyName: POLICY_NAMES.RolesUpdate,
	// 					})
	// 						? TABLE_COLUMNS
	// 						: TABLE_COLUMNS.slice(0, 2)
	// 				}
	// 				loading={loading}
	// 				dataSource={admins?.map((wa: WorkspaceAdminRole) => ({
	// 					name: wa.admin?.name,
	// 					email: wa.admin?.email,
	// 					role: wa.role,
	// 					photoUrl: wa.admin?.photo_url,
	// 					id: wa.admin?.id,
	// 					isSameAdmin: wa.admin?.id === admin?.id,
	// 					onDeleteHandler: () => {
	// 						if (!workspaceId) {
	// 							return
	// 						}
	// 						deleteAdminFromWorkspace({
	// 							variables: {
	// 								admin_id: wa.admin!.id,
	// 								workspace_id: workspaceId!,
	// 							},
	// 							refetchQueries: [
	// 								namedOperations.Query.GetWorkspaceAdmins,
	// 							],
	// 						})
	// 					},
	// 					onUpdateRoleHandler: (new_role: string) => {
	// 						changeAdminRole({
	// 							variables: {
	// 								admin_id: wa.admin!.id,
	// 								workspace_id: workspaceId!,
	// 								new_role,
	// 							},
	// 						})

	// 						let messageText = ''
	// 						const displayName =
	// 							wa.admin?.name ||
	// 							getDisplayNameFromEmail(wa.admin?.email || '')
	// 						switch (new_role) {
	// 							case AdminRole.Admin:
	// 								messageText = `${displayName} has been granted Admin powers 🧙`
	// 								break
	// 							case AdminRole.Member:
	// 								messageText = `${displayName} no longer has admin access.`
	// 								break
	// 						}
	// 						message.success(messageText)
	// 					},
	// 					canUpdateAdminRole: checkPolicyAccess({
	// 						policyName: POLICY_NAMES.RolesUpdate,
	// 					}),
	// 				}))}
	// 				pagination={false}
	// 				showHeader={false}
	// 				rowHasPadding
	// 			/>
	// 		</Card>
	// 	</div>
	// )
}

export default AllMembers

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
						{record?.name
							? record?.name
							: getDisplayNameFromEmail(record.email)}{' '}
						{record.isSameAdmin && '(You)'}
						<div>{record?.email}</div>
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
						<SvgTrashIconSolid />
					</Button>
				</PopConfirm>
			)
		},
	},
]
