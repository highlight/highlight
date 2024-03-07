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
import { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate, Route, Routes } from 'react-router-dom'

const DashboardsRouter = () => {
	const { project_id } = useParams<{ project_id: string }>()

	const { data: adminsData } = useGetWorkspaceAdminsByProjectIdQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})
	const { data, loading, called } = useGetDashboardDefinitionsQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})
	const [upsertDashboardMutation] = useUpsertDashboardMutation({
		refetchQueries: [namedOperations.Query.GetDashboardDefinitions],
	})

	useEffect(() => {
		if (loading || !called) {
			return
		}

		if (
			!data?.dashboard_definitions?.some((d) => d?.name === 'Web Vitals')
		) {
			upsertDashboardMutation({
				variables: {
					project_id: project_id!,
					metrics: Object.values(WEB_VITALS_CONFIGURATION),
					name: 'Web Vitals',
					layout: JSON.stringify(DEFAULT_METRICS_LAYOUT),
					is_default: true,
				},
			}).catch(H.consumeError)
		}

		const homeDashboard = data?.dashboard_definitions?.find(
			(d) => d?.name === 'Home',
		)
		if (!homeDashboard?.metrics?.length) {
			upsertDashboardMutation({
				variables: {
					project_id: project_id!,
					metrics: Object.values(HOME_DASHBOARD_CONFIGURATION),
					name: 'Home',
					layout: JSON.stringify(DEFAULT_HOME_DASHBOARD_LAYOUT),
					is_default: true,
				},
			}).catch(H.consumeError)
		} else {
			const newMetrics = [...homeDashboard.metrics]

			// if a legacy session count chart exists, update it
			const oldSessionMetricIdx = newMetrics.findIndex(
				(m) => m.component_type === 'SessionCountChart',
			)
			if (oldSessionMetricIdx !== -1) {
				newMetrics[oldSessionMetricIdx] =
					HOME_DASHBOARD_CONFIGURATION['Sessions']
			}

			// if a legacy error count chart exists, update it
			const oldErrorMetricIdx = newMetrics.findIndex(
				(m) => m.component_type === 'ErrorCountChart',
			)
			if (oldErrorMetricIdx !== -1) {
				newMetrics[oldErrorMetricIdx] =
					HOME_DASHBOARD_CONFIGURATION['Errors']
			}

			if (oldSessionMetricIdx !== -1 || oldErrorMetricIdx !== -1) {
				console.log(
					'Updating legacy home dashboard',
					[...homeDashboard.metrics],
					'to',
					newMetrics,
					{ oldSessionMetricIdx, oldErrorMetricIdx },
				)
				upsertDashboardMutation({
					variables: {
						...homeDashboard,
						metrics: newMetrics,
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
						project_id: project_id!,
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
	}, [loading, called])

	return (
		<DashboardsContextProvider
			value={{
				allAdmins: adminsData?.admins.map((wa) => wa.admin) || [],
				dashboards: data?.dashboard_definitions || [],
				updateDashboard: ({ id, name, metrics, layout }) => {
					return upsertDashboardMutation({
						variables: {
							id,
							project_id: project_id!,
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
			<Routes>
				<Route path="/analytics/*" element={<HomePageV2 />} />
				<Route path="dashboards/:id" element={<DashboardPage />} />
				<Route path="dashboards/*" element={<DashboardsHomePage />} />
				<Route
					path="*"
					element={
						<Navigate to={`/${project_id}/sessions`} replace />
					}
				/>
			</Routes>
		</DashboardsContextProvider>
	)
}

export default DashboardsRouter
