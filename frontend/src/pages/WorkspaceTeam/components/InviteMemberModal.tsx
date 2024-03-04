import Alert from '@components/Alert/Alert'
import CopyText from '@components/CopyText/CopyText'
import Input from '@components/Input/Input'
import { CircularSpinner } from '@components/Loading/Loading'
import Modal from '@components/Modal/Modal'
import Select from '@components/Select/Select'
import { useSendAdminWorkspaceInviteMutation } from '@graph/hooks'
import { AdminRole } from '@graph/schemas'
import { getWorkspaceInvitationLink } from '@pages/WorkspaceTeam/utils'
import { titleCaseString } from '@util/string'
import { message } from 'antd'
import clsx from 'clsx'
import moment from 'moment'
import { useEffect, useRef, useState } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

import commonStyles from '../../../Common.module.css'
import Button from '../../../components/Button/Button/Button'
import styles from './InviteMemberModal.module.css'

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
	const [newAdminRole, setNewAdminRole] = useState<AdminRole>(AdminRole.Admin)
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
		{ loading: sendLoading, data: sendInviteEmailData },
	] = useSendAdminWorkspaceInviteMutation()

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()

		if (!workspaceId) {
			return
		}

		sendInviteEmail({
			variables: {
				workspace_id: workspaceId!,
				email,
				base_url: window.location.origin,
				role: newAdminRole,
			},
		}).then(() => {
			message.success(`Invite email sent to ${email}!`, 5)
			emailRef.current?.focus()
		})
	}

	return (
		<Modal
			destroyOnClose
			centered
			title="Invite Member"
			visible={showModal}
			width={600}
			onCancel={() => toggleShowModal(false)}
		>
			<form onSubmit={onSubmit}>
				<p className={styles.boxSubTitle}>
					Invite a team member to '{`${workspaceName}`}' by entering
					an email below.
				</p>
				<div className={styles.buttonRow}>
					<Input
						className={styles.emailInput}
						placeholder="Email"
						type="email"
						name="invitedEmail"
						autoFocus
						value={email}
						onChange={(e) => {
							setEmail(e.target.value)
						}}
						addonAfter={
							<Select
								bordered={false}
								value={newAdminRole}
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
								onChange={setNewAdminRole}
							/>
						}
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
			{sendInviteEmailData?.sendAdminWorkspaceInvite && (
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
									text={
										sendInviteEmailData.sendAdminWorkspaceInvite
									}
									onCopyTooltipText="Copied invite link to clipboard!"
									inline
								/>
							</span>
						</>
					}
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
