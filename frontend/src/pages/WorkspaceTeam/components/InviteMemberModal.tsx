import Alert from '@components/Alert/Alert'
import CopyText from '@components/CopyText/CopyText'
import Input from '@components/Input/Input'
import { CircularSpinner } from '@components/Loading/Loading'
import Modal from '@components/Modal/Modal'
import { toast } from '@components/Toaster'
import { useSendAdminWorkspaceInviteMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { AdminRole } from '@graph/schemas'
import { Box, Stack, Text } from '@highlight-run/ui/components'
import { getWorkspaceInvitationLink } from '@pages/WorkspaceTeam/utils'
import clsx from 'clsx'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

import {
	DISABLED_REASON_IS_ADMIN,
	PopoverCell,
	RoleOptions,
} from '@/pages/WorkspaceTeam/components/AllMembers'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

import commonStyles from '../../../Common.module.css'
import Button from '../../../components/Button/Button/Button'
import styles from './InviteMemberModal.module.css'

function InviteMemberModal({
	toggleShowModal,
	workspaceId,
	workspaceName,
	workspaceInviteLinks,
}: {
	toggleShowModal: (value: boolean) => void
	workspaceId?: string
	workspaceName?: string
	workspaceInviteLinks?: any
}) {
	const [email, setEmail] = useState('')
	const [newAdminRole, setNewAdminRole] = useState<AdminRole>(
		AdminRole.Member,
	)
	const [newProjectIds, setNewProjectIds] = useState<string[]>([])
	const [autoinvite_email] = useQueryParam('autoinvite_email', StringParam)
	const emailRef = useRef<null | HTMLInputElement>(null)

	useEffect(() => {
		if (autoinvite_email) {
			setEmail(autoinvite_email)
			setNewAdminRole(AdminRole.Member)
			toggleShowModal(true)
		}
	}, [autoinvite_email, toggleShowModal])

	const [
		sendInviteEmail,
		{
			loading: sendLoading,
			data: sendData,
			error: sendError,
			reset: sendReset,
		},
	] = useSendAdminWorkspaceInviteMutation({
		fetchPolicy: 'no-cache',
		refetchQueries: [namedOperations.Query.GetWorkspaceSettings],
	})

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()

		if (!workspaceId) {
			return
		}

		sendInviteEmail({
			variables: {
				workspace_id: workspaceId!,
				email,
				role: newAdminRole,
				projectIds: newProjectIds,
			},
		}).then(() => {
			setEmail('')
			toast.success(`Invite email sent to ${email}!`, { duration: 5000 })
			emailRef.current?.focus()
		})
	}

	const { allProjects } = useApplicationContext()

	const disabledReason =
		newAdminRole === AdminRole.Admin ? DISABLED_REASON_IS_ADMIN : undefined

	return (
		<Modal
			centered
			title="Invite Member"
			visible
			width={600}
			onCancel={() => {
				toggleShowModal(false)
				setEmail('')
				sendReset()
			}}
		>
			<form onSubmit={onSubmit}>
				<p className={styles.boxSubTitle}>
					Invite a team member to '{`${workspaceName}`}' by entering
					an email below.
				</p>
				<Stack direction="row" alignItems="center">
					<Stack direction="row" alignItems="center">
						<Text lines="1">Role</Text>
						<Box borderRadius="4" p="4" cssClass={styles.popover}>
							<PopoverCell
								label="roles"
								options={RoleOptions}
								initialSelection={newAdminRole}
								onChange={(role) => {
									setNewAdminRole(role)
									setNewProjectIds([])
								}}
							/>
						</Box>
					</Stack>
					<Stack direction="row" alignItems="center">
						<Text lines="1">Project Access</Text>
						<Box borderRadius="4" p="4" cssClass={styles.popover}>
							<PopoverCell
								label="projects"
								options={allProjects?.map((p) => ({
									key: p?.id ?? '0',
									render: p?.name ?? '',
								}))}
								initialSelection={newProjectIds}
								filter
								onChange={setNewProjectIds}
								disabledReason={disabledReason}
							/>
						</Box>
					</Stack>
				</Stack>
				<div className={styles.buttonRow}>
					<Input
						ref={emailRef}
						className={styles.emailInput}
						placeholder="Email"
						type="email"
						required
						name="invitedEmail"
						autoFocus
						value={email}
						onChange={(e) => {
							setEmail(e.target.value)
						}}
					/>
					<Button
						trackingId="WorkspaceInviteMember"
						type="primary"
						className={clsx(
							commonStyles.submitButton,
							styles.inviteButton,
						)}
						htmlType="submit"
					>
						{sendLoading ? (
							<CircularSpinner
								style={{
									fontSize: 18,
									color: 'var(--text-primary-inverted)',
								}}
							/>
						) : (
							'Invite'
						)}
					</Button>
				</div>
			</form>
			{sendData?.sendAdminWorkspaceInvite && (
				<Alert
					shouldAlwaysShow
					trackingId="InviteAdminToWorkspaceConfirmation"
					message="An invite email has been sent!"
					type="success"
					description={
						<>
							You can also share with them this link:{' '}
							<span>
								<CopyText
									text={sendData.sendAdminWorkspaceInvite}
									onCopyTooltipText="Copied invite link to clipboard!"
									inline
								/>
							</span>
						</>
					}
				/>
			)}
			{sendError && (
				<Alert
					shouldAlwaysShow
					trackingId="InviteAdminToWorkspaceError"
					message="Couldn't send workspace invite"
					type="error"
					description={sendError.message}
				/>
			)}
			<hr className={styles.hr} />
			<p className={styles.boxSubTitle}>
				Or share this link with them (this link expires{' '}
				{moment(workspaceInviteLinks?.expiration_date).fromNow()}
				).
			</p>
			<CopyText
				text={getWorkspaceInvitationLink(
					workspaceInviteLinks?.secret || '',
					workspaceId!,
				)}
				onCopyTooltipText="Copied invite link to clipboard!"
			/>
		</Modal>
	)
}

export default InviteMemberModal
