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
					path="/:project_id/sessions/:session_secure_id?"
					element={<Player integrated={integrated} />}
				/>
				<Route
					path="/:project_id/errors/:error_secure_id?"
					element={<ErrorPage integrated={integrated} />}
				/>
				{/* If not logged in and project id is numeric and nonzero, redirect to login */}
				{!isLoggedIn && (
					<Route
						path="/:project_id([1-9]+[0-9]*)/*"
						element={<Navigate to="/" />}
					/>
				)}
				<Route
					path="/:project_id/settings"
					element={<ProjectSettings />}
				/>
				<Route path="/:project_id/alerts" element={<AlertsRouter />} />
				<Route
					path="/:project_id/dashboards"
					element={<DashboardsRouter />}
				/>
				<Route
					path="/:project_id/home"
					element={<DashboardsRouter />}
				/>
				<Route
					path="/:project_id/setup"
					element={<SetupRouter integrated={integrated} />}
				/>
				<Route
					path="/:project_id/integrations/:integration_type?"
					element={<IntegrationsPage />}
				/>
				<Route
					path="/:project_id/buttons"
					element={
						<Suspense fallback={null}>
							<Buttons />
						</Suspense>
					}
				/>
				<Route
					path="/:project_id/hit-targets"
					element={
						<Suspense fallback={null}>
							<HitTargets />
						</Suspense>
					}
				/>
				<Route
					path="/:project_id"
					element={
						integrated ? (
							<Navigate to={`/${project_id}/home`} />
						) : (
							<Navigate to={`/${project_id}/setup`} />
						)
					}
				/>
			</Routes>
		</>
	)
}

export default ApplicationRouter
