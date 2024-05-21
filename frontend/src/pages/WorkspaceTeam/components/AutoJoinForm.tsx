import { useAuthContext } from '@authentication/AuthContext'
import Select from '@components/Select/Select'
import { toast } from '@components/Toaster'
import Tooltip from '@components/Tooltip/Tooltip'
import {
	useGetWorkspaceAdminsQuery,
	useUpdateAllowedEmailOriginsMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Box, Text } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import Checkbox, { CheckboxChangeEvent } from 'antd/es/checkbox'
import React, { useState } from 'react'

import styles from './AutoJoinForm.module.css'

export const AutoJoinForm: React.FC = () => {
	const { workspace_id } = useParams<{ workspace_id: string }>()
	const { admin } = useAuthContext()
	const adminsEmailDomain = getEmailDomain(admin?.email)
	const [updateAllowedEmailOrigins] = useUpdateAllowedEmailOriginsMutation()
	const [autoJoinDomains, setAutoJoinDomains] = useState<string[]>([])
	const [adminDomains, setAdminDomains] = useState<string[]>([])

	const { loading } = useGetWorkspaceAdminsQuery({
		variables: { workspace_id: workspace_id! },
		skip: !workspace_id,
		onCompleted: (d) => {
			const emailOrigins = d.workspace?.allowed_auto_join_email_origins
				? JSON.parse(d.workspace.allowed_auto_join_email_origins)
				: []

			const allowedDomains = d.admins.reduce((acc: string[], wa) => {
				const adminDomain = getEmailDomain(wa.admin?.email)
				if (adminDomain.length && !acc.includes(adminDomain)) {
					acc.push(adminDomain)
				}
				return acc
			}, [])

			setAutoJoinDomains(emailOrigins)
			setAdminDomains(allowedDomains)
		},
	})

	const onChangeMsg = (domains: string[], msg: string) => {
		setAutoJoinDomains(domains)
		if (workspace_id) {
			updateAllowedEmailOrigins({
				variables: {
					allowed_auto_join_email_origins: JSON.stringify(domains),
					workspace_id,
				},
				refetchQueries: [namedOperations.Query.GetWorkspaceAdmins],
			}).then(() => {
				toast.success(msg)
			})
		}
	}

	const handleCheckboxChange = (event: CheckboxChangeEvent) => {
		const checked = event.target.checked
		if (checked) {
			onChangeMsg([adminsEmailDomain], 'Successfully enabled auto-join!')
		} else {
			onChangeMsg([], 'Successfully disabled auto-join!')
		}
	}

	const handleSelectChange = (domains: string[]) => {
		onChangeMsg(domains, 'Successfully updated auto-join email domains!')
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
						onChange={handleCheckboxChange}
					/>
					<Text>Auto-approved email domains</Text>
				</Box>
				<Select
					placeholder={`${adminsEmailDomain}, acme.corp, piedpiper.com`}
					className={styles.select}
					loading={loading}
					value={autoJoinDomains}
					mode="tags"
					onChange={handleSelectChange}
					options={adminDomains.map((emailOrigin) => ({
						displayValue: emailOrigin,
						id: emailOrigin,
						value: emailOrigin,
					}))}
				/>
			</div>
		</Tooltip>
	)
}

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
