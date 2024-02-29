import { useAuthContext } from '@authentication/AuthContext'
import AlertsRouter from '@pages/Alerts/AlertsRouter'
import LogAlertsRouter from '@pages/Alerts/LogAlert/LogAlertRouter'
import { CanvasPage } from '@pages/Buttons/CanvasV2'
import DashboardsRouter from '@pages/Dashboards/DashboardsRouter'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import ErrorsV2 from '@pages/ErrorsV2/ErrorsV2'
import IntegrationsPage from '@pages/IntegrationsPage/IntegrationsPage'
import LogsPage from '@pages/LogsPage/LogsPage'
import PlayerPage from '@pages/Player/PlayerPage'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { SetupRouter } from '@pages/Setup/SetupRouter/SetupRouter'
import { usePreloadErrors, usePreloadSessions } from '@util/preload'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { DEMO_PROJECT_ID } from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'
import { RelatedResourcePanel } from '@/components/RelatedResourcePanel/RelatedResourcePanel'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { SignInRedirect } from '@/pages/Auth/SignInRedirect'
import { GraphingEditor } from '@/pages/Graphing/GraphingEditor'
import { SettingsRouter } from '@/pages/SettingsRouter/SettingsRouter'
import { TracePanel } from '@/pages/Traces/TracePanel'
import { TracesPage } from '@/pages/Traces/TracesPage'

const Buttons = React.lazy(() => import('../../pages/Buttons/Buttons'))
const HitTargets = React.lazy(() => import('../../pages/Buttons/HitTargets'))

const ApplicationRouter: React.FC = () => {
	const { projectId } = useNumericProjectId()
	const { page, searchQuery } = useSearchContext()
	const { page: errorPage, searchQuery: errorSearchQuery } =
		useErrorSearchContext()
	usePreloadSessions({ page: page || 1, query: JSON.parse(searchQuery) })
	usePreloadErrors({
		page: errorPage || 1,
		query: JSON.parse(errorSearchQuery),
	})
	const { isLoggedIn, isHighlightAdmin } = useAuthContext()

	return (
		<>
			<Routes>
				<Route
					path="sessions/:session_secure_id?"
					element={<PlayerPage />}
				/>

				<Route
					path="errors/:error_secure_id?/:error_tab_key?/:error_object_id?"
					element={<ErrorsV2 />}
				/>

				{isLoggedIn || projectId === DEMO_PROJECT_ID ? (
					<>
						<Route path="traces" element={<TracesPage />}>
							<Route
								path=":trace_id/:span_id?"
								element={<TracePanel />}
							/>
						</Route>
						<Route
							path="logs/:log_cursor?"
							element={<LogsPage />}
						/>
						<Route path="settings/*" element={<SettingsRouter />} />
						<Route path="alerts/*" element={<AlertsRouter />} />
						<Route
							path="alerts/logs/*"
							element={<LogAlertsRouter />}
						/>

						<Route path="setup/*" element={<SetupRouter />} />
						<Route
							path="integrations/*"
							element={<IntegrationsPage />}
						/>
						<Route
							path="buttons/*"
							element={
								<Suspense fallback={null}>
									<Buttons />
								</Suspense>
							}
						/>
						<Route
							path="canvas/*"
							element={
								<Suspense fallback={null}>
									<CanvasPage />
								</Suspense>
							}
						/>
						<Route
							path="hit-targets/*"
							element={
								<Suspense fallback={null}>
									<HitTargets />
								</Suspense>
							}
						/>
						{isHighlightAdmin && (
							<Route
								path="metrics/*"
								element={
									<Suspense fallback={null}>
										<GraphingEditor />
									</Suspense>
								}
							/>
						)}

						<Route path="*" element={<DashboardsRouter />} />
					</>
				) : (
					<Route path="*" element={<SignInRedirect />} />
				)}
			</Routes>
			<RelatedResourcePanel />
		</>
	)
}

export default ApplicationRouter
