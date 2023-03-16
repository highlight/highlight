import { useAuthContext } from '@authentication/AuthContext'
import AlertsRouter from '@pages/Alerts/AlertsRouter'
import DashboardsRouter from '@pages/Dashboards/DashboardsRouter'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import ErrorLogCursorRedirect from '@pages/ErrorsV2/ErrorLogCursor/ErrorLogCursorRedirect'
import ErrorsV2 from '@pages/ErrorsV2/ErrorsV2'
import IntegrationsPage from '@pages/IntegrationsPage/IntegrationsPage'
import LogsPage from '@pages/LogsPage/LogsPage'
import PlayerPage from '@pages/Player/PlayerPage'
import ProjectSettings from '@pages/ProjectSettings/ProjectSettings'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import SetupRouter from '@pages/Setup/SetupRouter/SetupRouter'
import { usePreloadErrors, usePreloadSessions } from '@util/preload'
import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Buttons = React.lazy(() => import('../../pages/Buttons/Buttons'))
const HitTargets = React.lazy(() => import('../../pages/Buttons/HitTargets'))

interface Props {
	integrated: boolean
}

const ApplicationRouter = ({ integrated }: Props) => {
	const { page, backendSearchQuery } = useSearchContext()
	const { page: errorPage, backendSearchQuery: errorBackendSearchQuery } =
		useErrorSearchContext()
	usePreloadSessions({ page: page || 1, backendSearchQuery })
	usePreloadErrors({
		page: errorPage || 1,
		backendSearchQuery: errorBackendSearchQuery,
	})
	const { isLoggedIn, isHighlightAdmin } = useAuthContext()

	return (
		<Routes>
			<Route
				path="sessions/:session_secure_id?"
				element={<PlayerPage integrated={integrated} />}
			/>

			<Route
				path="errors/logs/:cursor_id"
				element={<ErrorLogCursorRedirect />}
			/>

			<Route
				path="errors/:error_secure_id?/:error_tab_key?/:error_object_id?"
				element={<ErrorsV2 integrated={integrated} />}
			/>

			{isLoggedIn ? (
				<>
					<Route path="logs/:log_cursor?" element={<LogsPage />} />
					<Route
						path="settings/:tab?"
						element={<ProjectSettings />}
					/>
					<Route path="alerts/*" element={<AlertsRouter />} />

					<Route
						path="setup/*"
						element={<SetupRouter clientIntegrated={integrated} />}
					/>

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
						path="hit-targets/*"
						element={
							<Suspense fallback={null}>
								<HitTargets />
							</Suspense>
						}
					/>

					<Route
						path="*"
						element={<DashboardsRouter integrated={integrated} />}
					/>
				</>
			) : (
				<Route path="*" element={<Navigate to="/" replace />} />
			)}
		</Routes>
	)
}

export default ApplicationRouter
