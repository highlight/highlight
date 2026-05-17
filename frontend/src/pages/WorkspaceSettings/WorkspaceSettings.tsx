import Alert from '@components/Alert/Alert'
import { FieldsBox } from '@components/FieldsBox/FieldsBox'
import { AdminRole } from '@graph/schemas'
import { Box, Heading, Text } from '@highlight-run/ui/components'
import { AutoJoinForm } from '@pages/WorkspaceTeam/components/AutoJoinForm'
import { Authorization } from '@util/authorization/authorization'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useAuthContext } from '@/authentication/AuthContext'

import { FieldsForm } from './FieldsForm/FieldsForm'

const WorkspaceSettings = () => {
	const { currentWorkspace } = useApplicationContext()
	const { workspaceRole } = useAuthContext()
	const isAdminRole = workspaceRole === AdminRole.Admin

	return (
		<Box style={{ maxWidth: 560 }} my="40" mx="auto">
			<Box display="flex" flexDirection="column" gap="32">
				<Box display="flex" flexDirection="column" gap="8">
					<Heading level="h3">Properties</Heading>
					<Text size="large" color="moderate">
						Manage your workspace details.
					</Text>
				</Box>

				<FieldsBox id="workspace">
					<FieldsForm
						defaultName={currentWorkspace?.name}
						disabled={!isAdminRole}
					/>
				</FieldsBox>

				<FieldsBox id="autojoin">
					<Box display="flex" flexDirection="column" gap="16" mb="16">
						<Heading level="h3">Auto Join</Heading>
						<Text color="moderate">
							Enable auto join to allow anyone with an approved
							email origin join.
						</Text>
					</Box>
					
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
			</Box>
		</Box>
	)
}

export default WorkspaceSettings
