import { useAuthContext } from '@authentication/AuthContext'
import KeyboardShortcutsEducation from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import AlertsRouter from '@pages/Alerts/AlertsRouter'
import DashboardsRouter from '@pages/Dashboards/DashboardsRouter'
import IntegrationsPage from '@pages/IntegrationsPage/IntegrationsPage'
import SetupRouter from '@pages/Setup/SetupRouter/SetupRouter'
import { useParams } from '@util/react-router/useParams'
import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ErrorPage from '../../pages/Error/ErrorPage'
import Player from '../../pages/Player/PlayerPage'
import ProjectSettings from '../../pages/ProjectSettings/ProjectSettings'

const Buttons = React.lazy(() => import('../../pages/Buttons/Buttons'))
const HitTargets = React.lazy(() => import('../../pages/Buttons/HitTargets'))

interface Props {
	integrated: boolean
}

const ApplicationRouter = ({ integrated }: Props) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { isLoggedIn } = useAuthContext()

	return (
		<>
			<KeyboardShortcutsEducation />
			<Routes>
				{/* These two routes do not require login */}
				<Route
					path="/sessions/:session_secure_id?"
					element={<Player integrated={integrated} />}
				/>
				<Route
					path="/errors/:error_secure_id?"
					element={<ErrorPage integrated={integrated} />}
				/>
				{/* If not logged in and project id is numeric and nonzero, redirect to login */}
				{!isLoggedIn && (
					<Route path="/*" element={<Navigate to="/" replace />} />
				)}
				<Route
					path="/*"
					element={
						integrated ? (
							<Navigate to={`/${project_id}/home`} replace />
						) : (
							<Navigate to={`/${project_id}/setup`} replace />
						)
					}
				/>
				<Route path="/settings" element={<ProjectSettings />} />
				<Route path="/alerts" element={<AlertsRouter />} />
				<Route path="/dashboards" element={<DashboardsRouter />} />
				<Route path="/home" element={<DashboardsRouter />} />
				<Route
					path="/setup"
					element={<SetupRouter integrated={integrated} />}
				/>
				<Route path="/integrations" element={<IntegrationsPage />} />
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
			</Routes>
		</>
	)
}

export default ApplicationRouter
