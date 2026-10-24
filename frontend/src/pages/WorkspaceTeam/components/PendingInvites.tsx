import { AdminAvatar } from '@components/Avatar/Avatar'
import Card from '@components/Card/Card'
import { toast } from '@components/Toaster'
import {
	useDeleteInviteLinkFromWorkspaceMutation,
	useGetWorkspacePendingInvitesQuery,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	Box,
	Button,
	IconSolidLoading,
	Modal,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import SvgTrashIconSolid from '@icons/TrashIconSolid'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'
import { titleCaseString } from '@util/string'
import clsx from 'clsx'
import moment from 'moment'
import React, { useState } from 'react'

import styles from './PendingInvites.module.css'

interface Props {
	workspaceId?: string
	active: boolean
	shouldRefetchData: boolean
}

type PendingInviteRow = {
	email: string
	creationDate: string
	id: string
	role: string
	onDeleteHandler: () => void
}

const PendingInvites = ({ workspaceId, active, shouldRefetchData }: Props) => {
	const { checkPolicyAccess } = useAuthorization()
	const canUpdateRoles = checkPolicyAccess({
		policyName: POLICY_NAMES.RolesUpdate,
	})
	const [inviteToDelete, setInviteToDelete] =
		useState<PendingInviteRow | null>(null)
	const { data, loading, error, refetch } =
		useGetWorkspacePendingInvitesQuery({
			variables: { workspace_id: workspaceId! },
			skip: !workspaceId,
		})
	const { workspacePendingInvites = [] } = data || {}
	const [deleteInviteLinkFromWorkspace, { loading: deleteLoading }] =
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

	const pendingInvites = workspacePendingInvites.map(
		(invite): PendingInviteRow => ({
			email: invite?.invitee_email ?? '',
			creationDate: invite?.created_at ?? '',
			id: invite?.id ?? '',
			role: invite?.invitee_role ?? '',
			onDeleteHandler: () => {
				const inviteId = invite?.id

				if (!workspaceId || !inviteId) {
					return
				}

				deleteInviteLinkFromWorkspace({
					variables: {
						workspace_invite_link_id: inviteId,
						workspace_id: workspaceId,
					},
					refetchQueries: [
						namedOperations.Query.GetWorkspacePendingInvites,
					],
				}).then(() => {
					setInviteToDelete(null)
				})
			},
		}),
	)

	React.useEffect(() => {
		if (active && shouldRefetchData) {
			refetch({ workspace_id: workspaceId! })
		}
	}, [active, shouldRefetchData, refetch, workspaceId])

	if (error) {
		return <div>{JSON.stringify(error)}</div>
	}

	const closeDeleteModal = () => {
		if (deleteLoading) {
			return
		}

		setInviteToDelete(null)
	}

	const handleDeleteInvite = () => {
		if (!inviteToDelete) {
			return
		}

		inviteToDelete.onDeleteHandler()
	}

	return (
		<div className={clsx(styles.inviteCardWrapper, 'highlight-mask')}>
			<Card noPadding>
				{loading ? (
					<Box p="16" display="flex" justifyContent="center">
						<Stack direction="row" align="center" gap="4">
							<IconSolidLoading className={styles.loadingIcon} />
							<Text
								size="small"
								color="secondaryContentOnEnabled"
							>
								Loading invites...
							</Text>
						</Stack>
					</Box>
				) : workspacePendingInvites.length == 0 ? (
					<Box p="16" display="flex" justifyContent="center">
						You currently do not have any pending invites.
					</Box>
				) : (
					<Table noBorder>
						<Table.Body>
							{pendingInvites.map((invite) => (
								<Table.Row
									key={invite.id || invite.email}
									gridColumns={
										canUpdateRoles
											? ['1fr', '120px', 'auto']
											: ['1fr', '120px']
									}
								>
									<Table.Cell>
										<div className={styles.inviteCard}>
											<AdminAvatar
												size={45}
												adminInfo={{
													email: invite.email,
												}}
											/>
											<div>
												<h4>{invite.email}</h4>
												<div
													className={
														styles.inviteTime
													}
												>
													{moment(
														invite.creationDate,
													).fromNow()}
												</div>
											</div>
										</div>
									</Table.Cell>
									<Table.Cell>
										<div className={styles.role}>
											{titleCaseString(invite.role)}
										</div>
									</Table.Cell>
									{canUpdateRoles && (
										<Table.Cell justifyContent="flex-end">
											<Button
												aria-label={`Delete invite for ${invite.email}`}
												kind="secondary"
												emphasis="low"
												size="xSmall"
												iconLeft={<SvgTrashIconSolid />}
												onClick={() => {
													setInviteToDelete(invite)
												}}
											/>
										</Table.Cell>
									)}
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				)}
			</Card>
			{inviteToDelete && (
				<Modal open={!!inviteToDelete} onClose={closeDeleteModal}>
					<Modal.Header>
						<Text size="xSmall" weight="medium">
							Delete invite for {inviteToDelete.email}?
						</Text>
					</Modal.Header>
					<Modal.Body>
						<Stack gap="8">
							<Text color="moderate">
								Their invite link will no longer be active. You
								can invite them again if they need access.
							</Text>
						</Stack>
					</Modal.Body>
					<Modal.Footer
						actions={
							<>
								<Button
									kind="secondary"
									emphasis="high"
									onClick={closeDeleteModal}
									disabled={deleteLoading}
								>
									Cancel
								</Button>
								<Button
									kind="danger"
									onClick={handleDeleteInvite}
									disabled={deleteLoading}
									iconLeft={
										deleteLoading ? (
											<IconSolidLoading
												className={styles.loadingIcon}
											/>
										) : undefined
									}
								>
									{`Remove ${inviteToDelete.email}`}
								</Button>
							</>
						}
					/>
				</Modal>
			)}
		</div>
	)
}

export { PendingInvites }
