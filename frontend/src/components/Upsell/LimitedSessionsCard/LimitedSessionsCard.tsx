import { useGetBillingDetailsForProjectQuery } from '@graph/hooks'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

import { isProjectWithinTrial } from '../../../util/billing/billing'
import ButtonLink from '../../Button/ButtonLink/ButtonLink'
import Card from '../../Card/Card'
import styles from './LimitedSessionsCard.module.scss'

const LimitedSessionCard = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { data } = useGetBillingDetailsForProjectQuery({
		variables: { project_id },
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
		<Card className={styles.container}>
			<h2>You've reached your session quota for this month 😔</h2>
			<p className={styles.description}>
				There are{' '}
				<b>
					{data?.billingDetailsForProject?.sessionsOutOfQuota}{' '}
					sessions
				</b>{' '}
				that can be viewed after you upgrade. Sessions recorded before
				you reached your quota are still viewable.
			</p>
			<ButtonLink
				className={styles.center}
				to={`/w/${data?.workspace_for_project?.id}/billing`}
				trackingId="LimitedSessionsCardUpgradePlan"
			>
				Upgrade Plan
			</ButtonLink>
		</Card>
	)
}

export default LimitedSessionCard
