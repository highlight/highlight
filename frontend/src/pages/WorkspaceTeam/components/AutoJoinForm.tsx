import { useAuthContext } from '@authentication/AuthContext'
import { toast } from '@components/Toaster'
import {
	useGetWorkspaceAdminsQuery,
	useUpdateAllowedEmailOriginsMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	Box,
	Select,
	SelectOption,
	SwitchButton,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import React, { useState } from 'react'

import { getEmailDomain } from '@/util/email'

import styles from './AutoJoinForm.module.css'

const extractUniqueAdminDomains = (
	admins: Array<{ admin?: { email?: string | null } | null }>,
): string[] => {
	return admins.reduce((acc: string[], wa) => {
		const adminDomain = getEmailDomain(wa.admin?.email)
		if (adminDomain.length && !acc.includes(adminDomain)) {
			acc.push(adminDomain)
		}
		return acc
	}, [])
}

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
			setAutoJoinDomains(emailOrigins)
			setAdminDomains(extractUniqueAdminDomains(d.admins))
		},
	})

	const onChangeMsg = (domains: string[], msg: string) => {
		setAutoJoinDomains(domains)
		setAdminDomains(adminDomains)
		if (!workspace_id) {
			return
		}
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

	const handleToggleChange = () => {
		const isCurrentlyEnabled = autoJoinDomains.length > 0
		if (isCurrentlyEnabled) {
			onChangeMsg([], 'Successfully disabled auto-join!')
			return
		}
		onChangeMsg([adminsEmailDomain], 'Successfully enabled auto-join!')
	}

	const handleSelectChange = (domains: SelectOption[]) => {
		onChangeMsg(
			domains.map((d) => String(d.value)),
			'Successfully updated auto-join email domains!',
		)
	}

	return (
		<div className={styles.container}>
			<Tooltip
				trigger={
					<Box
						display="flex"
						alignItems="center"
						gap="8"
						p="0"
						m="0"
					>
						<SwitchButton
							size="xxSmall"
							checked={autoJoinDomains.length > 0}
							onChange={handleToggleChange}
						/>
						<Text>Auto-approved email domains</Text>
					</Box>
				}
			>
				Automatically share the workspace with all users on this domain.
			</Tooltip>
			<Select
				creatable
				filterable
				displayMode="tags"
				loading={loading}
				placeholder={`${adminsEmailDomain}, acme.corp, piedpiper.com`}
				value={autoJoinDomains}
				onValueChange={handleSelectChange}
				options={adminDomains}
			/>
		</div>
	)
}
