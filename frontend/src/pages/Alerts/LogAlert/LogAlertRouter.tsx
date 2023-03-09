import LogMonitorPage from '@pages/Alerts/LogAlert/LogAlertPage'
import { useParams } from '@util/react-router/useParams'
import { Helmet } from 'react-helmet'
import { Navigate, Route, Routes } from 'react-router-dom'

const LogAlertsRouter = () => {
	const { project_id } = useParams<{ project_id: string }>()
	return (
		<>
			<Helmet>
				<title>Log Alerts</title>
			</Helmet>
			<Routes>
				<Route path="new" element={<LogMonitorPage />} />
				<Route
					path="*"
					element={<Navigate to={`/${project_id}/alerts`} replace />}
				/>
			</Routes>
		</>
	)
}

export default LogAlertsRouter
