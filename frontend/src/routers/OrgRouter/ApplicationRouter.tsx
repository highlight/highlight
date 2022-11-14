import { useAuthContext } from '@authentication/AuthContext'
import KeyboardShortcutsEducation from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import AlertsRouter from '@pages/Alerts/AlertsRouter'
import DashboardsRouter from '@pages/Dashboards/DashboardsRouter'
import ErrorsV2 from '@pages/ErrorsV2/ErrorsV2'
import IntegrationsPage from '@pages/IntegrationsPage/IntegrationsPage'
import SetupRouter from '@pages/Setup/SetupRouter/SetupRouter'
import useLocalStorage from '@rehooks/local-storage'
import { useParams } from '@util/react-router/useParams'
import React, { Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

const Buttons = React.lazy(() => import('../../pages/Buttons/Buttons'))
const HitTargets = React.lazy(() => import('../../pages/Buttons/HitTargets'))
import ErrorPage from '../../pages/Error/ErrorPage'
import PlayerPage from '../../pages/Player/PlayerPage'
import ProjectSettings from '../../pages/ProjectSettings/ProjectSettings'

interface Props {
	integrated: boolean
}

const ApplicationRouter = ({ integrated }: Props) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { isLoggedIn, isHighlightAdmin } = useAuthContext()
	const [newErrorsPageEnabled] = useLocalStorage(
		`highlight-new-errors-page-enabled`,
		false,
	)

	return (
		<>
			<KeyboardShortcutsEducation />
			<Switch>
				{/* These two routes do not require login */}
				<Route path="/:project_id/sessions/:session_secure_id?" exact>
					<PlayerPage integrated={integrated} />
				</Route>
				<Route path="/:project_id/errors/:error_secure_id?" exact>
					{isHighlightAdmin && newErrorsPageEnabled ? (
						<ErrorsV2 />
					) : (
						<ErrorPage integrated={integrated} />
					)}
				</Route>
				{/* If not logged in and project id is numeric and nonzero, redirect to login */}
				{!isLoggedIn && (
					<Route path="/:project_id([1-9]+[0-9]*)/*" exact>
						<Redirect to="/" />
					</Route>
				)}
				<Route path="/:project_id/settings">
					<ProjectSettings />
				</Route>
				<Route path="/:project_id/alerts">
					<AlertsRouter />
				</Route>
				<Route path="/:project_id/dashboards">
					<DashboardsRouter />
				</Route>
				<Route path="/:project_id/home">
					<DashboardsRouter />
				</Route>
				<Route path="/:project_id/setup">
					<SetupRouter integrated={integrated} />
				</Route>
				<Route path="/:project_id/integrations/:integration_type?">
					<IntegrationsPage />
				</Route>
				<Route path="/:project_id/buttons">
					<Suspense fallback={null}>
						<Buttons />
					</Suspense>
				</Route>
				<Route path="/:project_id/hit-targets">
					<Suspense fallback={null}>
						<HitTargets />
					</Suspense>
				</Route>
				<Route path="/:project_id">
					{integrated ? (
						<Redirect to={`/${project_id}/home`} />
					) : (
						<Redirect to={`/${project_id}/setup`} />
					)}
				</Route>
			</Switch>
		</>
	)
}

export default ApplicationRouter
