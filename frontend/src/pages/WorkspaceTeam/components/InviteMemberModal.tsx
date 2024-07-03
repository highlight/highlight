import Alert from '@components/Alert/Alert'
import CopyText from '@components/CopyText/CopyText'
import { toast } from '@components/Toaster'
import { useSendAdminWorkspaceInviteMutation } from '@graph/hooks'
import { AdminRole } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	Form,
	IconSolidClipboard,
	IconSolidInformationCircle,
	IconSolidUserAdd,
	Modal,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { getWorkspaceInvitationLink } from '@pages/WorkspaceTeam/utils'
import { useEffect, useRef, useState } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

import { useAuthContext } from '@/authentication/AuthContext'
import { Button } from '@/components/Button'
import {
	DISABLED_REASON_IS_ADMIN,
	RoleOptions,
} from '@/pages/WorkspaceTeam/components/AllMembers'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

function InviteMemberModal({
	showModal,
	toggleShowModal,
	workspaceId,
	workspaceName,
	workspaceInviteLinks,
}: {
	showModal: boolean
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

	const { workspaceRole } = useAuthContext()

	const roleOptions =
		workspaceRole === AdminRole.Admin ? RoleOptions : [RoleOptions[0]]

	const disabledReason =
		newAdminRole === AdminRole.Admin ? DISABLED_REASON_IS_ADMIN : undefined

	const inviteLink = getWorkspaceInvitationLink(
		workspaceInviteLinks?.secret || '',
		workspaceId!,
	)

	return (
		<Modal
			open={showModal}
			onClose={() => {
				// TODO: This doesn't seem to be firing
				toggleShowModal(false)
				setEmail('')
				sendReset()
			}}
		>
			<Modal.Header>
				<IconSolidUserAdd color={vars.color.n11} />
				<Text size="xxSmall" color="moderate">
					Invite users to {workspaceName}
				</Text>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Stack direction="column" gap="12">
						<Form.Input
							name="email"
							label="User email"
							icon={
								// TODO: Ask Julian what the icons should do
								<IconSolidInformationCircle
									color={vars.color.n8}
								/>
							}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>

						<Stack direction="row" gap="8">
							<Box style={{ width: '50%' }}>
								<Form.Select
									name="role"
									label="Role"
									icon={
										<IconSolidInformationCircle
											color={vars.color.n8}
										/>
									}
									onChange={(e) => {
										setNewAdminRole(
											e.target.value as AdminRole,
										)
										setNewProjectIds([])
									}}
								>
									{roleOptions.map((role) => (
										<option key={role.key} value={role.key}>
											{role.render}
										</option>
									))}
								</Form.Select>
							</Box>

							<Box style={{ width: '50%' }}>
								{/* TODO: Add disabled logic (disabledReason) */}
								{/* TODO: Fix for selecting multiple projects */}
								<Form.Select
									name="projects"
									label="Project Access"
									icon={
										<IconSolidInformationCircle
											color={vars.color.n8}
										/>
									}
								>
									{allProjects?.map((project) => (
										<option
											key={project?.id}
											value={project?.id}
										>
											{project?.name}
										</option>
									))}
								</Form.Select>
							</Box>
						</Stack>

						<Box
							style={{
								backgroundColor: vars.theme.static.divider.weak,
								height: 1,
								width: '100%',
							}}
						/>

						<Form.NamedSection
							label="Or share this link with them"
							name="shareLink"
							icon={
								<IconSolidInformationCircle
									color={vars.color.n8}
								/>
							}
						>
							<Stack direction="row" gap="6">
								<Form.Input
									name="shareLink"
									value={inviteLink}
									onClick={(e) => {
										// select all text in input
										e.currentTarget.select()
									}}
								/>
								<ButtonIcon
									icon={<IconSolidClipboard />}
									kind="secondary"
									onClick={() => {
										navigator.clipboard.writeText(
											inviteLink,
										)

										toast.success('Copied to clipboard!', {
											duration: 5000,
										})
									}}
								/>
							</Stack>
						</Form.NamedSection>
					</Stack>
				</Form>
				{/* TODO: See if we can delete PopoverCell */}
				{/* <form onSubmit={onSubmit}>
					<p className={styles.boxSubTitle}>
						Invite a team member to '{`${workspaceName}`}' by
						entering an email below.
					</p>
					<Stack direction="row" alignItems="center">
						<Stack direction="row" alignItems="center">
							<Text lines="1">Role</Text>
							<Box
								borderRadius="4"
								p="4"
								cssClass={styles.popover}
							>
								<PopoverCell
									label="roles"
									options={roleOptions}
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
							<Box
								borderRadius="4"
								p="4"
								cssClass={styles.popover}
							>
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
				</form> */}
				{/* TODO: Discuss w/ Julian what we want to do with this alert */}
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
				{/* <hr className={styles.hr} />
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
				/> */}
			</Modal.Body>
			<Modal.Footer
				actions={
					<>
						<Button
							trackingId="invite-admin-modal_cancel"
							kind="secondary"
							onClick={() => {
								toggleShowModal(false)
								setEmail('')
								sendReset()
							}}
						>
							Cancel
						</Button>
						<Button
							trackingId="invite-admin-modal_invite"
							kind="primary"
							onClick={onSubmit}
							loading={sendLoading}
							disabled={!email || sendLoading}
						>
							Invite user
						</Button>
					</>
				}
			>
				{/* TODO: Ask Julian what this should do */}
				<Button
					iconLeft={
						<IconSolidInformationCircle color={vars.color.n11} />
					}
					trackingId="invite-admin-modal_learn-more"
					emphasis="low"
					kind="secondary"
				>
					Learn more
				</Button>
			</Modal.Footer>
		</Modal>
	)
}

export default InviteMemberModal
