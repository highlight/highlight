import { useAuthContext } from '@authentication/AuthContext'
import { toast } from '@components/Toaster'
import {
	useGetWorkspaceAdminsQuery,
	useUpdateAllowedEmailOriginsMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	Box,
	IconSolidCheck,
	Select,
	SwitchButton,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import React, { ComponentProps, ReactNode, useCallback, useState } from 'react'

import { getEmailDomain } from '@/util/email'

import styles from './AutoJoinForm.module.css'

export type AutoJoinTooltipProps = {
	title: ReactNode
	children: ReactNode
}

export type AutoJoinCheckboxProps = Omit<
	ComponentProps<'input'>,
	'onChange'
> & {
	checked?: boolean
	onChange: (isChecked: boolean) => void
}

// Refactored to generalize Antd components: https://github.com/highlight/highlight/issues/8635
export const AutoJoinForm = () => {
	const FormTooltip: React.FC<AutoJoinTooltipProps> = useCallback(
		({ title, children, ...props }) => (
			<Tooltip trigger={children} {...props}>
				{title}
			</Tooltip>
		),
		[],
	)

	const Checkbox: React.FC<AutoJoinCheckboxProps> = useCallback(
		({ className, onChange, checked }) => {
			return (
				<SwitchButton
					className={clsx(
						className,
						styles.checkbox,
						checked && styles.isChecked,
					)}
					onClick={() => {
						onChange(!checked)
					}}
					iconLeft={<IconSolidCheck className={styles.checkMark} />}
					checked={checked}
				/>
			)
		},
		[],
	)

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

	const handleCheckboxChange = (checked: boolean) => {
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
		<FormTooltip title="Automatically share the workspace with all users on this domain.">
			<div className={styles.container}>
				<Box display="flex" alignItems="center" gap="8" p="0" m="0">
					<Checkbox
						checked={autoJoinDomains.length > 0}
						onChange={handleCheckboxChange}
					/>
					<Text>Auto-approved email domains</Text>
				</Box>
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
		</FormTooltip>
	)
}
