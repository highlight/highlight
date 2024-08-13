import { useAuthContext } from '@authentication/AuthContext'
import Tooltip from '@components/Tooltip/Tooltip'
import { Box, Text } from '@highlight-run/ui/components'
import { Divider } from 'antd'
import Checkbox, { CheckboxChangeEvent } from 'antd/es/checkbox'
import React from 'react'

import { getEmailDomain } from '@/util/email'

import styles from './AutoJoinInput.module.css'

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

	const handleMessageChecked = (event: CheckboxChangeEvent) => {
		const domains = event.target.checked ? [adminsEmailDomain] : []
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
			title="Automatically share the workspace with all users on this domain."
			align={{ offset: [0, 6] }}
			mouseEnterDelay={0}
		>
			<div className={styles.container}>
				<Box display="flex" alignItems="center" gap="8" p="0" m="0">
					<Checkbox
						checked={autoJoinDomains.length > 0}
						onChange={handleMessageChecked}
					/>
					<Text>Allowed email domains</Text>
				</Box>
				<Divider className="m-0 border-none pt-1" />
				<Text color="n11">
					Allow everyone with a <b>{getEmailDomain(admin?.email)}</b>{' '}
					email to join your workspace.
				</Text>
				<Divider className="m-0 border-none pt-1" />
			</div>
		</Tooltip>
	)
}
