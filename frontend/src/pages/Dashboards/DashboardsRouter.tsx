import {
	useGetDashboardDefinitionsQuery,
	useGetWorkspaceAdminsByProjectIdQuery,
	useUpsertDashboardMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { DashboardsContextProvider } from '@pages/Dashboards/DashboardsContext/DashboardsContext'
import { DEFAULT_METRICS_LAYOUT } from '@pages/Dashboards/Metrics'
import DashboardPage from '@pages/Dashboards/pages/Dashboard/DashboardPage'
import DashboardsHomePage from '@pages/Dashboards/pages/DashboardsHomePage/DashboardsHomePage'
import HomePageV2 from '@pages/Home/HomePageV2'
import {
	DEFAULT_HOME_DASHBOARD_LAYOUT,
	HOME_DASHBOARD_CONFIGURATION,
} from '@pages/Home/utils/HomePageUtils'
import {
	FRONTEND_OBSERVABILITY_CONFIGURATION,
	WEB_VITALS_CONFIGURATION,
} from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils'
import { useParams } from '@util/react-router/useParams'
import { H } from 'highlight.run'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

const DashboardsRouter = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { path } = useRouteMatch()
	const { data: adminsData } = useGetWorkspaceAdminsByProjectIdQuery({
		variables: { project_id },
	})
	const { data, loading, error, called } = useGetDashboardDefinitionsQuery({
		variables: { project_id },
	})
	const [upsertDashboardMutation] = useUpsertDashboardMutation({
		refetchQueries: [namedOperations.Query.GetDashboardDefinitions],
	})

	useEffect(() => {
		// create default dashboards
		if (project_id && !loading && !error && called) {
			if (
				!data?.dashboard_definitions?.some(
					(d) => d?.name === 'Web Vitals',
				)
			) {
				upsertDashboardMutation({
					variables: {
						project_id,
						metrics: Object.values(WEB_VITALS_CONFIGURATION),
						name: 'Web Vitals',
						layout: JSON.stringify(DEFAULT_METRICS_LAYOUT),
						is_default: true,
					},
				}).catch(H.consumeError)
			}
			if (!data?.dashboard_definitions?.some((d) => d?.name === 'Home')) {
				upsertDashboardMutation({
					variables: {
						project_id,
						metrics: Object.values(HOME_DASHBOARD_CONFIGURATION),
						name: 'Home',
						layout: JSON.stringify(DEFAULT_HOME_DASHBOARD_LAYOUT),
						is_default: true,
					},
				}).catch(H.consumeError)
			}
			if (
				!data?.dashboard_definitions?.some(
					(d) => d?.name === 'Request Metrics',
				)
			) {
				upsertDashboardMutation({
					variables: {
						project_id,
						metrics: Object.values(
							FRONTEND_OBSERVABILITY_CONFIGURATION,
						),
						name: 'Request Metrics',
						layout: JSON.stringify(DEFAULT_METRICS_LAYOUT),
						is_default: true,
					},
				}).catch(H.consumeError)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [project_id, loading, error, called, data])

	return (
		<DashboardsContextProvider
			value={{
				allAdmins: adminsData?.admins.map((wa) => wa.admin) || [],
				dashboards: data?.dashboard_definitions || [],
				updateDashboard: ({ id, name, metrics, layout }) => {
					return upsertDashboardMutation({
						variables: {
							id,
							project_id,
							metrics,
							name,
							layout,
						},
					})
				},
			}}
		>
			<Helmet>
				<title>Dashboards</title>
			</Helmet>
			<Switch>
				<Route exact path={`/:project_id/home`}>
					<HomePageV2 />
				</Route>
				<Route exact path={path}>
					<DashboardsHomePage />
				</Route>
				<Route path={`${path}/:id`}>
					<DashboardPage />
				</Route>
			</Switch>
		</DashboardsContextProvider>
	)
}

export default DashboardsRouter
