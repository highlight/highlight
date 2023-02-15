import { useAuthContext } from '@authentication/AuthContext'
import Switch from '@components/Switch/Switch'
import { useGetWorkspaceAdminsQuery } from '@graph/hooks'
import { Box, Text, Tooltip } from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import { Select } from 'antd'
import React, { useState } from 'react'

import * as styles from './index.css'

type Props = {
	onChange: (domains: string[]) => void
}

export const AutoJoinEmailsInput: React.FC<Props> = ({ onChange }) => {
	const [origins, setOrigins] = useState<{
		emailOrigins: string[]
		allowedEmailOrigins: string[]
	}>({ emailOrigins: [], allowedEmailOrigins: [] })
	const { workspace_id } = useParams<{ workspace_id: string }>()
	const { admin } = useAuthContext()
	const { loading } = useGetWorkspaceAdminsQuery({
		variables: { workspace_id: workspace_id || '' },
		onCompleted: (d) => {
			let emailOrigins: string[] = []
			if (d.workspace?.allowed_auto_join_email_origins) {
				emailOrigins = JSON.parse(
					d.workspace.allowed_auto_join_email_origins,
				)
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
			setOrigins({ emailOrigins, allowedEmailOrigins: allowedDomains })
		},
	})

	const handleChange = (domains: string[]) => {
		setOrigins((p) => ({
			emailOrigins: domains,
			allowedEmailOrigins: p.allowedEmailOrigins,
		}))
		onChange(domains)
	}

	const adminsEmailDomain = getEmailDomain(admin?.email)
	const noEmailDomains = origins.emailOrigins.length === 0

	return (
		<Tooltip
			trigger={
				<Box width="full">
					<Switch
						className={styles.toggle}
						trackingId="WorkspaceAutoJoin"
						label={<Text color="weak">Auto join</Text>}
						labelFirst
						checked={origins.emailOrigins.length > 0}
						loading={loading}
						onChange={(checked) => {
							if (checked) {
								handleChange([adminsEmailDomain])
							} else {
								handleChange([])
							}
						}}
					/>
					<Select
						className={styles.select}
						placeholder={`${adminsEmailDomain}, acme.corp, piedpiper.com`}
						loading={loading}
						value={
							noEmailDomains
								? [adminsEmailDomain]
								: origins.emailOrigins
						}
						mode="tags"
						disabled={noEmailDomains}
						onChange={handleChange}
						options={origins.allowedEmailOrigins.map(
							(emailOrigin) => ({
								displayValue: emailOrigin,
								id: emailOrigin,
								value: emailOrigin,
							}),
						)}
					/>
				</Box>
			}
		>
			<Box style={{ maxWidth: 250 }} p="8">
				<Text>
					Automatically share the workspace with all users on this
					domain.
				</Text>
			</Box>
		</Tooltip>
	)
}

export const getEmailDomain = (email?: string) => {
	if (!email) {
		return ''
	}
	if (!email.includes('@')) {
		return ''
	}

	const [, domain] = email.split('@')
	return domain
}
