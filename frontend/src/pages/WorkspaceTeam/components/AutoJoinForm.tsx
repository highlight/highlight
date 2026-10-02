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
	Stack,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import React, { useState } from 'react'

import { getEmailDomain } from '@/util/email'
import Switch from '@/components/Switch/Switch'

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
		setAdminDomains(adminDomains)

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

	const handleSwitchChange = (checked: boolean) => {
		if (checked) {
			onChangeMsg([adminsEmailDomain], 'Successfully enabled auto-join!')
		} else {
			onChangeMsg([], 'Successfully disabled auto-join!')
		}
	}

	const handleSelectChange = (domains: { name: string; value: string }[]) => {
		onChangeMsg(
			domains.map((d) => d.value),
			'Successfully updated auto-join email domains!',
		)
	}

	return (
		<Stack gap="16">
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Stack gap="4">
					<Text weight="bold" size="small">
						Auto-approved email domains
					</Text>
					<Text color="moderate" size="xSmall">
						Automatically share the workspace with all users on
						this domain.
					</Text>
				</Stack>
				<Switch
					trackingId="WorkspaceAutoJoin-Switch"
					checked={autoJoinDomains.length > 0}
					onChange={handleSwitchChange}
				/>
			</Box>
			<Stack gap="8">
				<Text color="moderate" size="small">
					Approved email origins can join this workspace
					automatically.
				</Text>
				<Select
					creatable
					filterable
					displayMode="tags"
					loading={loading}
					placeholder={`${adminsEmailDomain}, acme.corp, piedpiper.com`}
					value={autoJoinDomains.map((d) => ({
						name: d,
						value: d,
					}))}
					onValueChange={handleSelectChange}
					options={adminDomains.map((d) => ({
						name: d,
						value: d,
					}))}
				/>
			</Stack>
		</Stack>

	)
}

