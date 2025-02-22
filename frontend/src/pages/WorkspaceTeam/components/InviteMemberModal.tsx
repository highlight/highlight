import { toast } from '@components/Toaster'
import {
	useGetWorkspaceSettingsQuery,
	useSendAdminWorkspaceInviteMutation,
} from '@graph/hooks'
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
	SelectOption,
	Stack,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { getWorkspaceInvitationLink } from '@pages/WorkspaceTeam/utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

import { useAuthContext } from '@/authentication/AuthContext'
import { Button } from '@/components/Button'
import {
	DISABLED_REASON_IS_ADMIN,
	DISABLED_REASON_NOT_ENTERPRISE,
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
	const form = Form.useStore<{
		email: string
		role: AdminRole
		projects: string[]
	}>({
		defaultValues: {
			email: '',
			role: AdminRole.Member,
			projects: [],
		},
	})
	const emailInputRef = useRef<HTMLInputElement>(null)
	const [autoinvite_email] = useQueryParam('autoinvite_email', StringParam)
	const { allProjects } = useApplicationContext()
	const { workspaceRole } = useAuthContext()

	const email = form.useValue(form.names.email)
	const newAdminRole = form.useValue(form.names.role)
	const newProjectIds = form.useValue(form.names.projects)

	const { data: workspaceSettings } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: workspaceId! },
		skip: !workspaceId,
	})

	const canUpdateProjects =
		workspaceSettings?.workspaceSettings?.enable_project_level_access ??
		false

	const [
		sendInviteEmail,
		{ loading: sendInviteLoading, reset: sendInviteReset },
	] = useSendAdminWorkspaceInviteMutation({
		fetchPolicy: 'no-cache',
		refetchQueries: [namedOperations.Query.GetWorkspaceSettings],
	})

	const roleOptions =
		workspaceRole === AdminRole.Admin ? RoleOptions : [RoleOptions[0]]

	const disabledReason =
		newAdminRole === AdminRole.Admin
			? DISABLED_REASON_IS_ADMIN
			: !canUpdateProjects
				? DISABLED_REASON_NOT_ENTERPRISE
				: undefined

	const inviteLink = getWorkspaceInvitationLink(
		workspaceInviteLinks?.secret || '',
		workspaceId!,
	)

	useEffect(() => {
		if (autoinvite_email) {
			form.setValues({
				email: autoinvite_email,
				role: AdminRole.Member,
				projects: [],
			})
			toggleShowModal(true)
		}
	}, [autoinvite_email, form, toggleShowModal])

	const resetForm = useCallback(
		(close?: true) => {
			if (close) {
				toggleShowModal(false)
			}
			sendInviteReset()
			form.reset()
		},
		[form, sendInviteReset, toggleShowModal],
	)

	const projectOptions = useMemo(
		() =>
			allProjects?.map((p) => ({
				name: p?.name ?? '',
				value: p?.name ?? '',
				id: p?.id ?? '',
			})) ?? [],
		[allProjects],
	)

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (!workspaceId) {
			return
		}

		const projectIdsToSend =
			newAdminRole !== AdminRole.Admin && !newProjectIds?.length
				? (allProjects?.map((p) => p?.id).filter(Boolean) as string[])
				: newProjectIds.map((p: { id: string }) => p.id)

		sendInviteEmail({
			variables: {
				workspace_id: workspaceId!,
				email,
				role: newAdminRole,
				projectIds: projectIdsToSend,
			},
		})
			.then(() => {
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
									onClick={(e: {
										stopPropagation: () => void
									}) => {
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
				form.setValue(form.names.email, '')
				emailInputRef.current?.focus()
			})
			.catch((error) => {
				toast.error(`Couldn't send workspace invite`, {
					duration: 5000,
					content: <Text size="xSmall">{error.message}</Text>,
				})
			})
	}

	return (
		<Modal open={showModal} onClose={() => resetForm(true)}>
			<Form onSubmit={onSubmit} store={form}>
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
							name={form.names.email}
							label="User email"
							required
							type="email"
						/>
						<Stack direction="row" gap="8">
							<Box style={{ width: '50%' }}>
								<Form.Select
									name={form.names.role}
									label="Role"
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
											name={form.names.projects}
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
											options={projectOptions}
											onValueChange={(
												values: SelectOption[],
											) => {
												if (values?.length) {
													form.setValue(
														form.names.projects,
														values,
													)
												}
											}}
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
								onClick={() => resetForm(true)}
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
