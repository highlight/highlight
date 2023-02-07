import { LinkButton } from '@components/LinkButton'
import {
	Box,
	Callout,
	IconSolidSparkles,
	Stack,
	Text,
	vars,
} from '@highlight-run/ui'
import React from 'react'
const { DEMO_SESSION_URL } = import.meta.env

export const CompleteSetup = () => {
	return (
		<Box margin="auto" style={{ maxWidth: 300 }}>
			<Callout
				title="Finish installing Highlight"
				icon={() => (
					<Box
						alignItems="center"
						borderRadius="5"
						display="flex"
						flexShrink={0}
						justifyContent="center"
						style={{
							backgroundColor:
								vars.theme.static.surface.sentiment.informative,
							height: 22,
							width: 22,
						}}
					>
						<IconSolidSparkles
							color={
								vars.theme.static.content.sentiment.informative
							}
						/>
					</Box>
				)}
			>
				<Box display="flex" flexDirection="column" gap="16">
					<Text color="moderate">
						View your app's sessions by completing the setup
						process.
					</Text>
					<Stack gap="6" direction="row">
						<LinkButton to="/setup" trackingId="finish-setup">
							Finish setup
						</LinkButton>
						<LinkButton
							to={DEMO_SESSION_URL}
							trackingId="view-demo-session"
							kind="secondary"
							emphasis="low"
						>
							View demo session
						</LinkButton>
					</Stack>
				</Box>
			</Callout>
		</Box>
	)
}
