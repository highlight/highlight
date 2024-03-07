import DemoWorkspaceButton from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import LoadingBox from '@components/LoadingBox'
import { useProjectId } from '@hooks/useProjectId'
import DashboardPage from '@pages/Dashboards/pages/Dashboard/DashboardPage'
import analytics from '@util/analytics'
import { useClientIntegration } from '@util/integrated'
import Lottie from 'lottie-react'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import ElevatedCard from '../../components/ElevatedCard/ElevatedCard'
import WaitingAnimation from '../../lottie/waiting.json'
import styles from './HomePage.module.css'

const HomePageV2 = () => {
	useEffect(() => analytics.page('Analytics'), [])

	const { projectId } = useProjectId()
	const { integrated, loading: integratedLoading } = useClientIntegration()

	if (integratedLoading) {
		return <LoadingBox />
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
											<Link to={`/${projectId}/setup`}>
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
