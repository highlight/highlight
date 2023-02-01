import DemoWorkspaceButton, {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import DashboardPage from '@pages/Dashboards/pages/Dashboard/DashboardPage'
import analytics from '@util/analytics'
import { useIntegrated } from '@util/integrated'
import { useParams } from '@util/react-router/useParams'
import Lottie from 'lottie-react'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import ElevatedCard from '../../components/ElevatedCard/ElevatedCard'
import WaitingAnimation from '../../lottie/waiting.json'
import styles from './HomePage.module.scss'

const HomePageV2 = () => {
	useEffect(() => analytics.page(), [])

	const { project_id } = useParams<{ project_id: string }>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id
	const { integrated, loading: integratedLoading } = useIntegrated()

	if (integratedLoading) {
		return null
	}

	return (
		<>
			<Helmet>
				<title>Analytics</title>
			</Helmet>
			<div className={styles.dashboardWrapper}>
				<div className={styles.dashboard}>
					<div className={styles.dashboardBody}>
						<DashboardPage
							header={
								<div>
									<h2>Analytics</h2>
								</div>
							}
							dashboardName="Home"
						/>
					</div>
					{!integrated && (
						<div className={styles.noDataContainer}>
							<ElevatedCard
								title={
									integrated
										? "You're too fast!"
										: 'Waiting for Installation...'
								}
								animation={
									<Lottie animationData={WaitingAnimation} />
								}
							>
								<p>
									{integrated ? (
										"We're still processing your sessions and errors. Check back here later."
									) : (
										<>
											Please follow the{' '}
											<Link
												to={`/${projectIdRemapped}/setup`}
											>
												setup instructions
											</Link>{' '}
											to install Highlight. It should take
											less than a minute for us to detect
											installation.
											<div
												className={
													styles.demoWorkspaceButton
												}
											>
												<DemoWorkspaceButton
													integrated={integrated}
												/>
											</div>
										</>
									)}
								</p>
							</ElevatedCard>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default HomePageV2
