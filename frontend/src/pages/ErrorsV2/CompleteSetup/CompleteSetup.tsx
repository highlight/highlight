import { LinkButton } from '@components/LinkButton'
import {
	Box,
	Callout,
	IconSolidSparkles,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'

export const CompleteSetup = () => {
	const { projectId } = useProjectId()

	return (
		<Box margin="auto" style={{ maxWidth: 300 }}>
			<Callout
				title="Finish installing Highlight"
				icon={IconSolidSparkles}
			>
				<Box display="flex" flexDirection="column" gap="16">
					<Text color="moderate">
						View your app's backend errors by completing the setup
						process.
					</Text>
					<Stack gap="6" direction="row">
						<LinkButton
							to={`/${projectId}/setup/backend`}
							trackingId="finish-setup-errors"
						>
							Finish setup
						</LinkButton>
						<LinkButton
							to="/demo/errors"
							trackingId="view-demo-error"
							kind="secondary"
							emphasis="low"
						>
							View demo errors
						</LinkButton>
					</Stack>
				</Box>
			</Callout>
		</Box>
	)
}
