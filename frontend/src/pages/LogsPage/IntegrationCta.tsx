import { Button } from '@components/Button'
import { LinkButton } from '@components/LinkButton'
import { useGetLogsIntegrationQuery } from '@graph/hooks'
import { Box, Callout, Stack, Text } from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import useLocalStorage from '@rehooks/local-storage'
import moment from 'moment'
import React from 'react'

export const IntegrationCta: React.FC = () => {
	const { projectId } = useProjectId()
	const [dismissedAt, setDismissedAt] = useLocalStorage(
		'setup-logging-cta-dismissed-at',
	)
	const { data, loading } = useGetLogsIntegrationQuery({
		variables: { project_id: projectId! },
		fetchPolicy: 'cache-and-network',
	})

	// Don't show if dismissed in the last 15 days
	const dismissed = dismissedAt
		? moment(dismissedAt).diff(moment(), 'days') < 15
		: false

	if (loading || data?.logsIntegration?.integrated || dismissed) {
		return null
	}

	return (
		<Box m="8">
			<Callout kind="info">
				<Stack direction="row" justify="space-between" align="center">
					<Stack gap="12" direction="column" paddingBottom="6">
						<Box mt="6">
							<Text weight="bold" size="medium">
								Logging for your backend?
							</Text>
						</Box>

						<Text>
							You're just a few lines away from getting visibility
							in your backend logs.
						</Text>
					</Stack>

					<Stack direction="row" gap="8">
						<LinkButton
							to={`/${projectId}/setup/backend-logging`}
							trackingId="logs-page_setup-backend-logging"
						>
							Open setup
						</LinkButton>
						<Button
							onClick={() => {
								setDismissedAt(moment().toISOString())
							}}
							kind="secondary"
							trackingId="logs-page_hide-setup-backend-logging"
						>
							Hide
						</Button>
					</Stack>
				</Stack>
			</Callout>
		</Box>
	)
}
