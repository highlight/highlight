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
		<Box style={{ maxWidth: 500 }}>
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
							to={`/${projectId}/setup/alerts`}
							trackingId="finish-setup-errors"
						>
							Finish setup
						</LinkButton>
					</Stack>
				</Box>
			</Callout>
		</Box>
	)
}
