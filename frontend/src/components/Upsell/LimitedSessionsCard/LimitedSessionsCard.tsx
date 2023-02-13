import { useGetBillingDetailsForProjectQuery } from '@graph/hooks'
import { Box, Card, Text } from '@highlight-run/ui'
import { isProjectWithinTrial } from '@util/billing/billing'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

import ButtonLink from '../../Button/ButtonLink/ButtonLink'
import styles from './LimitedSessionsCard.module.scss'

const LimitedSessionCard = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { data } = useGetBillingDetailsForProjectQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})

	/** Show upsell when the current usage is 80% of the project's plan. */
	const upsell =
		(data?.billingDetailsForProject?.meter ?? 0) /
			(data?.billingDetailsForProject?.plan.quota ?? 1) >=
		1.0

	/** An project is within a trial period by us setting an explicit trial end date on the project. */
	const projectWithinTrialPeriod = isProjectWithinTrial(
		data?.workspace_for_project,
	)

	if (
		!upsell ||
		projectWithinTrialPeriod ||
		data?.workspace_for_project?.allow_meter_overage
	) {
		return null
	}

	return (
		<Box mb="12" p="16">
			<Card border="secondary">
				<Box display="flex" flexDirection="column" gap="16">
					<Text size="large" weight="bold" align="center">
						You've reached your session limit for this month 😔
					</Text>
					<Text color="n11" align="center">
						Your workspace is configured to stop recording new
						sessions once the monthly limit is reached. There have
						been{' '}
						<b>
							{data?.billingDetailsForProject?.sessionsOutOfQuota}{' '}
							sessions
						</b>{' '}
						after this limit.
					</Text>
					<ButtonLink
						className={styles.center}
						to={`/w/${data?.workspace_for_project?.id}/upgrade-plan`}
						trackingId="LimitedSessionsCardUpgradePlan"
					>
						Upgrade Plan
					</ButtonLink>
				</Box>
			</Card>
		</Box>
	)
}

export default LimitedSessionCard
