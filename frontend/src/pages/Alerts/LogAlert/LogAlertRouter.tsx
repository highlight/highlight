import { getSlackUrl } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import { useGetLogAlertsPagePayloadQuery } from '@graph/hooks'
import { useNumericProjectId } from '@hooks/useProjectId'
import { LogAlertsContextProvider } from '@pages/Alerts/LogAlert/context'
import LogMonitorPage from '@pages/Alerts/LogAlert/LogAlertPage'
import analytics from '@util/analytics'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate, Route, Routes } from 'react-router-dom'

const LogAlertsRouter = () => {
	const { projectId } = useNumericProjectId()
	const { data, loading } = useGetLogAlertsPagePayloadQuery({
		variables: { project_id: projectId! },
		skip: !projectId,
	})
	const slackUrl = getSlackUrl(projectId!)

	useEffect(() => analytics.page(), [])

	return (
		<LogAlertsContextProvider
			value={{
				alertsPayload: data,
				loading,
				slackUrl,
			}}
		>
			<Helmet>
				<title>Log Alerts</title>
			</Helmet>
			<Routes>
				<Route path="new" element={<LogMonitorPage />} />
				<Route
					path="*"
					element={<Navigate to={`/${projectId}/alerts`} replace />}
				/>
			</Routes>
		</LogAlertsContextProvider>
	)
}

export default LogAlertsRouter
