import { useAuthContext } from '@authentication/AuthContext'
import Switch from '@components/Switch/Switch'
import { Box, Text, Tooltip } from '@highlight-run/ui'
import { Select } from 'antd'
import React, { useEffect, useState } from 'react'

import * as styles from './index.css'

type Props = {
	onChange: (domains: string[]) => void
}

export const AutoJoinEmailsInput: React.FC<Props> = ({ onChange }) => {
	const [origins, setOrigins] = useState<{
		emailOrigins: string[]
		allowedEmailOrigins: string[]
	}>({ emailOrigins: [], allowedEmailOrigins: [] })
	const { admin } = useAuthContext()

	useEffect(() => {
		setOrigins({
			emailOrigins: [],
			allowedEmailOrigins: [getEmailDomain(admin?.email)],
		})
	}, [admin])

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
