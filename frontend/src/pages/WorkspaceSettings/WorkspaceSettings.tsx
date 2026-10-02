import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { AdminRole } from '@graph/schemas'
import { Box, Callout, Text } from '@highlight-run/ui/components'
import { AutoJoinForm } from '@pages/WorkspaceTeam/components/AutoJoinForm'
import { Authorization } from '@util/authorization/authorization'
import analytics from '@util/analytics'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useAuthContext } from '@/authentication/AuthContext'
import { useSessionStorage } from 'react-use'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'
import { FieldsForm } from './FieldsForm/FieldsForm'
import styles from './WorkspaceSettings.module.css'

const AUTO_JOIN_ADMIN_CALLOUT_STORAGE_KEY =
	'highlightHideAlert-AdminNoAccessToAutoJoinDomains'
const AUTO_JOIN_ADMIN_CALLOUT_TRACKING_ID =
	'AlertClose-AdminNoAccessToAutoJoinDomains'

const AutoJoinAdminFallback = () => {
	const [temporarilyHideCallout, setTemporarilyHideCallout] =
		useSessionStorage(AUTO_JOIN_ADMIN_CALLOUT_STORAGE_KEY, false)

	if (temporarilyHideCallout) {
		return null
	}

	return (
		<Callout
			kind="info"
			title="You don't have access to auto-access domains."
			handleCloseClick={() => {
				analytics.track(AUTO_JOIN_ADMIN_CALLOUT_TRACKING_ID)
				setTemporarilyHideCallout(true)
			}}
		>
			<Text color="moderate">
				You don't have permission to configure auto-access domains.
				Please contact a workspace admin to make changes.
			</Text>
		</Callout>
	)
}

const WorkspaceSettings = () => {
	const { currentWorkspace } = useApplicationContext()
	const { workspaceRole } = useAuthContext()
	const isAdminRole = workspaceRole === AdminRole.Admin

	return (
		<Box>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<div className={styles.container}>
					<div className={styles.titleContainer}>
						<div>
							<h3>Properties</h3>
							<p className={layoutStyles.subTitle}>
								Manage your workspace details.
							</p>
						</div>
					</div>
					<FieldsBox id="workspace">
						<FieldsForm
							defaultName={currentWorkspace?.name}
							disabled={!isAdminRole}
						/>
					</FieldsBox>
					<FieldsBox id="autojoin">
						<h3>Auto Join</h3>
						<p>
							Enable auto join to allow anyone with an approved
							email origin join.
						</p>
						<Authorization
							allowedRoles={[AdminRole.Admin]}
							forbiddenFallback={<AutoJoinAdminFallback />}
						>
							<AutoJoinForm />
						</Authorization>
					</FieldsBox>
				</div>
			</Box>
		</Box>
	)
}

export default WorkspaceSettings
