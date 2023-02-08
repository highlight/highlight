import { useAuthContext } from '@authentication/AuthContext'
import AlertsRouter from '@pages/Alerts/AlertsRouter'
import DashboardsRouter from '@pages/Dashboards/DashboardsRouter'
import ErrorsV2 from '@pages/ErrorsV2/ErrorsV2'
import IntegrationsPage from '@pages/IntegrationsPage/IntegrationsPage'
import SetupRouter from '@pages/Setup/SetupRouter/SetupRouter'
import { useParams } from '@util/react-router/useParams'
import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Buttons = React.lazy(() => import('../../pages/Buttons/Buttons'))
const HitTargets = React.lazy(() => import('../../pages/Buttons/HitTargets'))
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import LogsPage from '@pages/LogsPage/LogsPage'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { usePreloadErrors, usePreloadSessions } from '@util/preload'

import PlayerPage from '../../pages/Player/PlayerPage'
import ProjectSettings from '../../pages/ProjectSettings/ProjectSettings'

interface Props {
	integrated: boolean
}

const ApplicationRouter = ({ integrated }: Props) => {
	const { page } = useSearchContext()
	const { page: errorPage } = useErrorSearchContext()
	usePreloadSessions({ page: page || 1 })
	usePreloadErrors({ page: errorPage || 1 })
	const { project_id } = useParams<{ project_id: string }>()
	const { isLoggedIn, isHighlightAdmin } = useAuthContext()

	return (
		<>
			<Routes>
				{/* These two routes do not require login */}
				<Route path="/sessions/:session_secure_id?">
					<PlayerPage integrated={integrated} />
				</Route>
				<Route path="/errors/:error_secure_id?/:error_tab_key?/:error_object_id?">
					<ErrorsV2 integrated={integrated} />
				</Route>
				{isHighlightAdmin && (
					<Route path="/logs">
						<LogsPage />
					</Route>
				)}
				{/* If not logged in and project id is numeric and nonzero, Navigate to login */}
				{!isLoggedIn && (
					<Route path="/*" element={<Navigate to="/" replace />} />
				)}
				<Route path="/settings" element={<ProjectSettings />} />
				<Route path="/alerts" element={<AlertsRouter />} />
				<Route path="/dashboards" element={<DashboardsRouter />} />
				<Route path="/analytics" element={<DashboardsRouter />} />
				<Route
					path="/setup"
					element={<SetupRouter integrated={integrated} />}
				/>

				<Route
					path="/integrations/:integration_type"
					element={<IntegrationsPage />}
				/>
				<Route
					path="/buttons"
					element={
						<Suspense fallback={null}>
							<Buttons />
						</Suspense>
					}
				/>
				<Route
					path="/hit-targets"
					element={
						<Suspense fallback={null}>
							<HitTargets />
						</Suspense>
					}
				/>
				<Route
					path="/*"
					element={
						integrated ? (
							<Navigate to={`/${project_id}/sessions`} replace />
						) : (
							<Navigate to={`/${project_id}/setup`} replace />
						)
					}
				/>
			</Routes>
		</>
	)
}

export default ApplicationRouter
