import { useAuthContext } from '@authentication/AuthContext'
import Select from '@components/Select/Select'
import Switch from '@components/Switch/Switch'
import Tooltip from '@components/Tooltip/Tooltip'
import {
	useGetWorkspaceAdminsQuery,
	useUpdateAllowedEmailOriginsMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'

import styles from './AutoJoinForm.module.scss'

const COMMON_EMAIL_PROVIDERS = ['gmail', 'yahoo', 'hotmail']

function AutoJoinForm({
	updateOrigins,
	newWorkspace,
}: {
	updateOrigins?: (domains: string[]) => void
	newWorkspace?: boolean
}) {
	const [emailOrigins, setEmailOrigins] = useState<string[]>([])
	const [allowedEmailOrigins, setAllowedEmailOrigins] = useState<string[]>([])
	const { workspace_id } = useParams<{ workspace_id: string }>()
	const { admin } = useAuthContext()
	const { loading } = useGetWorkspaceAdminsQuery({
		variables: { workspace_id },
		onCompleted: (d) => {
			if (d.workspace?.allowed_auto_join_email_origins) {
				const emailOrigins = JSON.parse(
					d.workspace.allowed_auto_join_email_origins,
				)
				setEmailOrigins(emailOrigins)
			}
			const allowedDomains: string[] = []
			d.admins.forEach((wa) => {
				const adminDomain = getEmailDomain(wa.admin?.email)
				if (
					adminDomain.length > 0 &&
					!allowedDomains.includes(adminDomain)
				)
					allowedDomains.push(adminDomain)
			})
			setAllowedEmailOrigins(allowedDomains)
		},
	})

	const [updateAllowedEmailOrigins] = useUpdateAllowedEmailOriginsMutation()
	const onChangeMsg = (domains: string[], msg: string) => {
		setEmailOrigins(domains)
		if (updateOrigins) {
			updateOrigins(domains)
		} else {
			updateAllowedEmailOrigins({
				variables: {
					allowed_auto_join_email_origins: JSON.stringify(domains),
					workspace_id: workspace_id,
				},
				refetchQueries: [namedOperations.Query.GetWorkspaceAdmins],
			}).then(() => {
				message.success(msg)
			})
		}
	}
	const onChange = (domains: string[]) => {
		onChangeMsg(domains, 'Successfully updated auto-join email domains!')
	}

	const adminsEmailDomain = getEmailDomain(admin?.email)

	useEffect(() => {
		if (newWorkspace && adminsEmailDomain.length) {
			setEmailOrigins([adminsEmailDomain])
		}
	}, [newWorkspace, adminsEmailDomain])

	// don't show if this is for workspace creation but admin is not a company email
	if (
		newWorkspace &&
		COMMON_EMAIL_PROVIDERS.some((p) => adminsEmailDomain.indexOf(p) !== -1)
	) {
		return null
	}

	return (
		<Tooltip
			title={
				'Automatically share the workspace with all users on this domain.'
			}
			align={{ offset: [0, 6] }}
			mouseEnterDelay={0}
		>
			<div className={styles.container}>
				<Switch
					trackingId="WorkspaceAutoJoin"
					label="Enable Auto Join"
					checked={emailOrigins.length > 0}
					loading={loading}
					onChange={(checked) => {
						if (checked) {
							onChangeMsg(
								[adminsEmailDomain],
								'Successfully enabled auto-join!',
							)
						} else {
							onChangeMsg([], 'Successfully disabled auto-join!')
						}
					}}
					className={styles.switchClass}
				/>
				<Select
					placeholder={`${adminsEmailDomain}, acme.corp, piedpiper.com`}
					className={styles.select}
					loading={loading}
					value={newWorkspace ? [adminsEmailDomain] : emailOrigins}
					mode="tags"
					disabled={newWorkspace}
					onChange={onChange}
					options={allowedEmailOrigins.map((emailOrigin) => ({
						displayValue: emailOrigin,
						id: emailOrigin,
						value: emailOrigin,
					}))}
				/>
			</div>
		</Tooltip>
	)
}

export default AutoJoinForm

const getEmailDomain = (email?: string) => {
	if (!email) {
		return ''
	}
	if (!email.includes('@')) {
		return ''
	}

	const [, domain] = email.split('@')
	return domain
}
