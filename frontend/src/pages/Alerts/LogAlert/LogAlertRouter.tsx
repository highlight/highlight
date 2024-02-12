import { getSlackUrl } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import { useGetLogAlertsPagePayloadQuery } from '@graph/hooks'
import { useNumericProjectId } from '@hooks/useProjectId'
import { LogAlertsContextProvider } from '@pages/Alerts/LogAlert/context'
import LogAlertPage from '@pages/Alerts/LogAlert/LogAlertPage'
import { Helmet } from 'react-helmet'
import { Route, Routes } from 'react-router-dom'

const LogAlertsRouter = () => {
	const { projectId } = useNumericProjectId()

	const { data, loading } = useGetLogAlertsPagePayloadQuery({
		variables: { project_id: projectId! },
		skip: !projectId,
	})

	const slackUrl = getSlackUrl(projectId!)

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
				<Route path="new" element={<LogAlertPage />} />
				<Route path=":alert_id" element={<LogAlertPage />} />
			</Routes>
		</LogAlertsContextProvider>
	)
}

export default LogAlertsRouter
