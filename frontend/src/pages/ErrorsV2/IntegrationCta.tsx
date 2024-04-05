import { Button } from '@components/Button'
import { LinkButton } from '@components/LinkButton'
import { useGetServerIntegrationQuery } from '@graph/hooks'
import { Box, Callout, Stack, Text } from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import useLocalStorage from '@rehooks/local-storage'
import moment from 'moment'
import React from 'react'

export const IntegrationCta: React.FC = () => {
	const { projectId } = useProjectId()
	const [dismissedAt, setDismissedAt] = useLocalStorage(
		'setup-backend-errors-cta-dismissed-at',
	)
	const { data, loading } = useGetServerIntegrationQuery({
		variables: { project_id: projectId! },
		fetchPolicy: 'cache-and-network',
	})

	// Don't show if dismissed in the last 15 days
	const dismissed = dismissedAt
		? moment(dismissedAt).diff(moment(), 'days') < 15
		: false

	if (loading || data?.serverIntegration?.integrated || dismissed) {
		return null
	}

	return (
		<Box mt="24" mb="8">
			<Callout kind="info">
				<Stack direction="row" justify="space-between" align="center">
					<Stack gap="12" direction="column" paddingBottom="6">
						<Box mt="6">
							<Text weight="bold" size="medium">
								Error monitoring for your backend?
							</Text>
						</Box>

						<Text>
							You're just a few lines away from getting visibility
							into your backend errors.
						</Text>
					</Stack>

					<Stack direction="row" gap="8">
						<LinkButton
							to={`/${projectId}/setup/backend`}
							trackingId="errors-page_setup-backend-errors"
						>
							Open setup
						</LinkButton>
						<Button
							onClick={() => {
								setDismissedAt(moment().toISOString())
							}}
							kind="secondary"
							trackingId="errors-page_hide-setup-backend-errors"
						>
							Hide
						</Button>
					</Stack>
				</Stack>
			</Callout>
		</Box>
	)
}
