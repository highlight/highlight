import DemoWorkspaceButton, {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { useGetAdminQuery } from '@graph/hooks'
import DashboardPage from '@pages/Dashboards/pages/Dashboard/DashboardPage'
import { HomePageTimeFilter } from '@pages/Home/utils/HomeCharts'
import { useIntegrated } from '@util/integrated'
import { useParams } from '@util/react-router/useParams'
import Lottie from 'lottie-react'
import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import ElevatedCard from '../../components/ElevatedCard/ElevatedCard'
import WaitingAnimation from '../../lottie/waiting.json'
import { HomePageFiltersContext } from './components/HomePageFilters/HomePageFiltersContext'
import styles from './HomePage.module.scss'

const HomePageV2 = () => {
	const { loading: adminLoading, data: adminData } = useGetAdminQuery({
		skip: false,
	})
	const { project_id } = useParams<{ project_id: string }>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id
	const [dateRangeLength, setDateRangeLength] = useState<number>(
		HomePageTimeFilter[1].value,
	)
	const [hasData, setHasData] = useState<boolean>(true)
	const { integrated, loading: integratedLoading } = useIntegrated()

	if (integratedLoading || adminLoading) {
		return null
	}

	return (
		<HomePageFiltersContext
			value={{ dateRangeLength, setDateRangeLength, hasData, setHasData }}
		>
			<Helmet>
				<title>Home</title>
			</Helmet>
			<div className={styles.dashboardWrapper}>
				<div className={styles.dashboard}>
					<div className={styles.dashboardBody}>
						<DashboardPage
							header={
								<div>
									<h2>
										{integrated
											? `${
													adminData?.admin?.name
														? `Hey ${
																adminData.admin.name.split(
																	' ',
																)[0]
														  }, welcome`
														: `Welcome`
											  } back to Highlight.`
											: 'Welcome to Highlight'}
									</h2>
								</div>
							}
							dashboardName={'Home'}
						/>
					</div>
					{!hasData && !integrated && (
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
		</HomePageFiltersContext>
	)
}

export default HomePageV2
