import { useAuthContext } from '@authentication/AuthContext'
import AlertsRouter from '@pages/Alerts/AlertsRouter'
import LogAlertsRouter from '@pages/Alerts/LogAlert/LogAlertRouter'
import { CanvasPage } from '@pages/Buttons/CanvasV2'
import ErrorsV2 from '@pages/ErrorsV2/ErrorsV2'
import IntegrationsPage from '@pages/IntegrationsPage/IntegrationsPage'
import LogsPage from '@pages/LogsPage/LogsPage'
import PlayerPage from '@pages/Player/PlayerPage'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { SetupRouter } from '@pages/Setup/SetupRouter/SetupRouter'
import { usePreloadSessions } from '@util/preload'
import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { DEMO_PROJECT_ID } from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'
import { RelatedResourcePanel } from '@/components/RelatedResources/RelatedResourcePanel'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { SignInRedirect } from '@/pages/Auth/SignInRedirect'
import DashboardRouter from '@/pages/Graphing/DashboardRouter'
import { SettingsRouter } from '@/pages/SettingsRouter/SettingsRouter'
import { TracePanel } from '@/pages/Traces/TracePanel'
import { TracesPage } from '@/pages/Traces/TracesPage'

const Buttons = React.lazy(() => import('../../pages/Buttons/Buttons'))
const HitTargets = React.lazy(() => import('../../pages/Buttons/HitTargets'))

const BASE_PATH = 'sessions'

const ApplicationRouter: React.FC = () => {
	const { projectId } = useNumericProjectId()
	const { page, searchQuery } = useSearchContext()
	usePreloadSessions({ page: page || 1, query: JSON.parse(searchQuery) })
	const { isLoggedIn } = useAuthContext()

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
						<Route
							path="dashboards/*"
							element={<DashboardRouter />}
						/>
						<Route
							path="*"
							element={<Navigate to={BASE_PATH} replace />}
						/>
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
