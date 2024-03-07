import Alert from '@components/Alert/Alert'
import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { AdminRole } from '@graph/schemas'
import { Box } from '@highlight-run/ui/components'
import { AutoJoinForm } from '@pages/WorkspaceTeam/components/AutoJoinForm'
import { Authorization } from '@util/authorization/authorization'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'
import { FieldsForm } from './FieldsForm/FieldsForm'
import styles from './WorkspaceSettings.module.css'

const WorkspaceSettings = () => {
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
						<FieldsForm />
					</FieldsBox>
					<FieldsBox id="autojoin">
						<h3>Auto Join</h3>
						<p>
							Enable auto join to allow anyone with an approved
							email origin join.
						</p>
						<Authorization
							allowedRoles={[AdminRole.Admin]}
							forbiddenFallback={
								<Alert
									trackingId="AdminNoAccessToAutoJoinDomains"
									type="info"
									message="You don't have access to auto-access domains."
									description={`You don't have permission to configure auto-access domains. Please contact a workspace admin to make changes.`}
								/>
							}
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
