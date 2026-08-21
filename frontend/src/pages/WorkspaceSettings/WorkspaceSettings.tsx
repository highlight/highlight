import { AdminRole } from '@graph/schemas'
import {
	Box,
	Callout,
	Heading,
	Stack,
	Text,
} from '@highlight-run/ui/components'
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
		<Box width="full" p="40">
			<Box style={{ maxWidth: 800 }} mx="auto">
				<Stack gap="32">
					<Stack gap="8">
						<Heading level="h2">Properties</Heading>
						<Text color="moderate">
							Manage your workspace details.
						</Text>
					</Stack>

					<Stack gap="16">
						<Box
							border="dividerWeak"
							borderRadius="8"
							p="24"
							background="white"
							id="workspace"
						>
							<FieldsForm
								defaultName={currentWorkspace?.name}
								disabled={!isAdminRole}
							/>
						</Box>

						<Box
							border="dividerWeak"
							borderRadius="8"
							p="24"
							background="white"
							id="autojoin"
						>
							<Stack gap="16">
								<Stack gap="4">
									<Heading level="h4">Auto Join</Heading>
									<Text color="moderate">
										Enable auto join to allow anyone with an
										approved email origin join.
									</Text>
								</Stack>
								<Authorization
									allowedRoles={[AdminRole.Admin]}
									forbiddenFallback={
										<Callout
											kind="info"
											title="You don't have access to auto-access domains."
										>
											You don't have permission to
											configure auto-access domains.
											Please contact a workspace admin to
											make changes.
										</Callout>
									}
								>
									<AutoJoinForm />
								</Authorization>
							</Stack>
						</Box>
					</Stack>
				</Stack>
			</Box>
		</Box>

	)
}

export default WorkspaceSettings
