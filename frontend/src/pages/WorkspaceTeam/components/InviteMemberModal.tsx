import { toast } from '@components/Toaster'
import { useSendAdminWorkspaceInviteMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
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
	Tooltip,
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
	workspaceId,
	workspaceName,
	workspaceInviteLinks,
	toggleShowModal,
}: {
	showModal: boolean
	workspaceId?: string
	workspaceName?: string
	workspaceInviteLinks?: any
	toggleShowModal: (value: boolean) => void
}) {
	const emailInputRef = useRef<HTMLInputElement>(null)
	const [email, setEmail] = useState('')
	const [newAdminRole, setNewAdminRole] = useState<AdminRole>(
		AdminRole.Member,
	)
	const [newProjectIds, setNewProjectIds] = useState<string[]>([])
	const [autoinvite_email] = useQueryParam('autoinvite_email', StringParam)

	useEffect(() => {
		if (autoinvite_email) {
			setEmail(autoinvite_email)
			setNewAdminRole(AdminRole.Member)
			toggleShowModal(true)
		}
	}, [autoinvite_email, toggleShowModal])

	const [
		sendInviteEmail,
		{ loading: sendInviteLoading, reset: sendInviteReset },
	] = useSendAdminWorkspaceInviteMutation({
		fetchPolicy: 'no-cache',
		refetchQueries: [namedOperations.Query.GetWorkspaceSettings],
	})

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()

		if (!workspaceId) {
			return
		}

		const projectIdsToSend =
			newAdminRole !== AdminRole.Admin && newProjectIds.length === 0
				? (allProjects?.map((p) => p?.id).filter(Boolean) as string[])
				: newProjectIds

		sendInviteEmail({
			variables: {
				workspace_id: workspaceId!,
				email,
				role: newAdminRole,
				projectIds: projectIdsToSend,
			},
		})
			.then(() => {
				resetForm()
				toast.success(`Invite email sent!`, {
					duration: 10000,
					content: (
						<Stack direction="column" gap="12" pb="6">
							<Text size="xSmall">
								A welcome email has been sent to {email}. You
								can also share this invite link with them.
							</Text>
							<Box display="inline-block">
								<Button
									trackingId="invite-admin-modal_copy-invite-link"
									iconLeft={<IconSolidClipboard />}
									kind="secondary"
									onClick={(e) => {
										e.stopPropagation()
										navigator.clipboard.writeText(
											inviteLink,
										)
									}}
								>
									Copy invite link
								</Button>
							</Box>
						</Stack>
					),
				})
				emailInputRef.current?.focus()
			})
			.catch((error) => {
				toast.error(`Couldn't send workspace invite`, {
					duration: 5000,
					content: <Text size="xSmall">{error.message}</Text>,
				})
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

	const formStore = Form.useStore({
		defaultValues: {
			email,
			role: newAdminRole,
			projects: newProjectIds,
		},
	})

	const resetForm = () => {
		setEmail('')
		setNewAdminRole(AdminRole.Member)
		setNewProjectIds([])
		sendInviteReset()
		formStore?.reset()
	}

	return (
		<Modal
			open={showModal}
			onClose={() => {
				toggleShowModal(false)
				resetForm()
			}}
		>
			<Form onSubmit={onSubmit} store={formStore}>
				<Modal.Header>
					<IconSolidUserAdd color={vars.color.n11} />
					<Text size="xxSmall" color="moderate">
						Invite users to {workspaceName}
					</Text>
				</Modal.Header>
				<Modal.Body>
					<Stack direction="column" gap="16">
						<Form.Input
							ref={emailInputRef}
							name="email"
							label="User email"
							value={email}
							required
							type="email"
							onChange={(e) => {
								setEmail(e.target.value)
							}}
						/>
						<Stack direction="row" gap="8">
							<Box style={{ width: '50%' }}>
								<Form.Select
									name="role"
									label="Role"
									onValueChange={(option) => {
										setNewAdminRole(option.value)
										setNewProjectIds([])
									}}
								>
									{roleOptions.map((role) => (
										<Form.Option
											key={role.key}
											value={role.key}
										>
											{role.render}
										</Form.Option>
									))}
								</Form.Select>
							</Box>

							<Box style={{ width: '50%' }}>
								<Tooltip
									disabled={!disabledReason}
									style={{ display: 'block' }}
									trigger={
										<Form.Select
											name="projects"
											label="Project Access"
											renderValue={(options) => {
												if (
													newAdminRole ===
														AdminRole.Admin ||
													options.length === 0
												) {
													return 'All'
												}

												return Array.isArray(options)
													? options.join(', ')
													: options
											}}
											disabled={!!disabledReason}
											placeholder={
												!!disabledReason
													? 'All projects'
													: 'Select projects'
											}
											options={
												allProjects?.map(
													(p) => p?.name ?? '',
												) ?? []
											}
											icon={
												<IconSolidInformationCircle
													color={vars.color.n8}
												/>
											}
										/>
									}
								>
									<Box p="4">
										<Text>{disabledReason}</Text>
									</Box>
								</Tooltip>
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
				</Modal.Body>
				<Modal.Footer
					actions={
						<>
							<Button
								trackingId="invite-admin-modal_cancel"
								kind="secondary"
								onClick={() => {
									toggleShowModal(false)
									resetForm()
								}}
							>
								Cancel
							</Button>
							<Button
								trackingId="invite-admin-modal_invite"
								kind="primary"
								loading={sendInviteLoading}
								disabled={sendInviteLoading}
								type="submit"
							>
								Invite user
							</Button>
						</>
					}
				/>
			</Form>
		</Modal>
	)
}

export default InviteMemberModal
