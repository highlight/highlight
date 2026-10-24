import { useAuthContext } from '@authentication/AuthContext'
import { Box, SwitchButton, Text, Tooltip } from '@highlight-run/ui/components'
import React from 'react'

import { getEmailDomain } from '@/util/email'

const COMMON_EMAIL_PROVIDERS = ['gmail', 'yahoo', 'hotmail']

type Props = {
	autoJoinDomains: string[]
	setAutoJoinDomains: (domains: string[]) => void
}

export const AutoJoinInput: React.FC<Props> = ({
	autoJoinDomains,
	setAutoJoinDomains,
}) => {
	const { admin } = useAuthContext()
	const adminsEmailDomain = getEmailDomain(admin?.email)

	const handleSwitchChange = (checked: boolean) => {
		const domains = checked ? [adminsEmailDomain] : []
		setAutoJoinDomains(domains)
	}

	// don't show if this is for workspace creation but admin is not a company email
	if (
		COMMON_EMAIL_PROVIDERS.some((p) => adminsEmailDomain.indexOf(p) !== -1)
	) {
		return null
	}

	return (
		<Tooltip
			trigger={
				<Box display="flex" flexDirection="column" gap="4">
					<Box display="flex" alignItems="center" gap="8">
						<SwitchButton
							checked={autoJoinDomains.length > 0}
							onChange={() =>
								handleSwitchChange(!autoJoinDomains.length)
							}
						/>
						<Text weight="medium">Allowed email domains</Text>
					</Box>
					<Text color="n11">
						Allow everyone with a <b>{adminsEmailDomain}</b> email
						to join your workspace.
					</Text>
				</Box>
			}
		>
			Automatically share the workspace with all users on this domain.
		</Tooltip>
	)
}
