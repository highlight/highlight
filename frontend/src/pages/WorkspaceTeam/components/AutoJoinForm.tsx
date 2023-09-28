import { useAuthContext } from '@authentication/AuthContext'
import Tooltip from '@components/Tooltip/Tooltip'
import { useUpdateAllowedEmailOriginsMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Box, Text } from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import { Divider, message } from 'antd'
import Checkbox from 'antd/es/checkbox'
import React, { useEffect, useState } from 'react'

import styles from './AutoJoinForm.module.css'

const COMMON_EMAIL_PROVIDERS = ['gmail', 'yahoo', 'hotmail']

function AutoJoinForm({
	updateOrigins,
	newWorkspace,
}: {
	updateOrigins?: (domains: string[]) => void
	newWorkspace?: boolean
	label?: string
	labelFirst?: boolean
}) {
	const [origins, setOrigins] = useState<{
		emailOrigins: string[]
		allowedEmailOrigins: string[]
	}>({ emailOrigins: [], allowedEmailOrigins: [] })
	const { workspace_id } = useParams<{ workspace_id: string }>()
	const { admin } = useAuthContext()

	const [updateAllowedEmailOrigins] = useUpdateAllowedEmailOriginsMutation()
	const onChangeMsg = (domains: string[], msg: string) => {
		setOrigins((p) => ({
			emailOrigins: domains,
			allowedEmailOrigins: p.allowedEmailOrigins,
		}))
		if (updateOrigins) {
			updateOrigins(domains)
		} else if (workspace_id) {
			updateAllowedEmailOrigins({
				variables: {
					allowed_auto_join_email_origins: JSON.stringify(domains),
					workspace_id,
				},
				refetchQueries: [namedOperations.Query.GetWorkspaceAdmins],
			}).then(() => {
				message.success(msg)
			})
		}
	}

	const adminsEmailDomain = getEmailDomain(admin?.email)

	useEffect(() => {
		if (newWorkspace && adminsEmailDomain.length) {
			setOrigins((p) => ({
				emailOrigins: [adminsEmailDomain],
				allowedEmailOrigins: p.allowedEmailOrigins,
			}))
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
			title="Automatically share the workspace with all users on this domain."
			align={{ offset: [0, 6] }}
			mouseEnterDelay={0}
		>
			<div className={styles.container}>
				<Box display="flex" alignItems="center" gap="8" p="0" m="0">
					<Checkbox
						checked={origins.emailOrigins.length > 0}
						onChange={(event) => {
							const checked = event.target.checked
							if (checked) {
								onChangeMsg(
									[adminsEmailDomain],
									'Successfully enabled auto-join!',
								)
							} else {
								onChangeMsg(
									[],
									'Successfully disabled auto-join!',
								)
							}
						}}
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
