import { useAuthContext } from '@authentication/AuthContext'
import AlertsRouter from '@pages/Alerts/AlertsRouter'
import LogAlertsRouter from '@pages/Alerts/LogAlert/LogAlertRouter'
import ErrorsV2 from '@pages/ErrorsV2/ErrorsV2'
import IntegrationsPage from '@pages/IntegrationsPage/IntegrationsPage'
import LogsPage from '@pages/LogsPage/LogsPage'
import { PlayerPage } from '@pages/Player/PlayerPage'
import { SetupRouter } from '@pages/Setup/SetupRouter/SetupRouter'
import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { DEMO_PROJECT_ID } from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'
import { RelatedResourcePanel } from '@/components/RelatedResources/RelatedResourcePanel'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { SignInRedirect } from '@/pages/Auth/SignInRedirect'
import DashboardRouter from '@/pages/Graphing/DashboardRouter'
import { SettingsRouter } from '@/pages/SettingsRouter/SettingsRouter'
import { TracesPage } from '@/pages/Traces/TracesPage'

const BASE_PATH = 'sessions'

const ApplicationRouter: React.FC = () => {
	const { projectId } = useNumericProjectId()
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
						<Route
							path="traces/:trace_id?/:span_id?"
							element={<TracesPage />}
						/>
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
						<Route path="metrics/*" element={<DashboardRouter />} />
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
