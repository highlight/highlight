import { getSlackUrl } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import { useGetAlertsPagePayloadQuery } from '@graph/hooks'
import { GetAlertsPagePayloadQuery } from '@graph/operations'
import AlertsPage from '@pages/Alerts/Alerts'
import { AlertsContextProvider } from '@pages/Alerts/AlertsContext/AlertsContext'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate, Route, Routes } from 'react-router-dom'

import ErrorAlertPage from '@/pages/Alerts/ErrorAlert/ErrorAlertPage'
import SessionAlertPage from '@/pages/Alerts/SessionAlert/SessionAlertPage'

import { AlertForm } from './AlertForm'

const AlertsRouter = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const [alertsPayload, setAlertsPayload] = useState<
		GetAlertsPagePayloadQuery | undefined
	>(undefined)
	const { data, loading } = useGetAlertsPagePayloadQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})
	const slackUrl = getSlackUrl(project_id ?? '')

	useEffect(() => {
		if (!loading) {
			setAlertsPayload(data)
		}
	}, [data, loading])

	return (
		<AlertsContextProvider
			value={{
				alertsPayload,
				setAlertsPayload,
				loading,
				slackUrl,
			}}
		>
			<Helmet>
				<title>Alerts</title>
			</Helmet>
			<Routes>
				<Route path="*" element={<AlertsPage />} />
				<Route path="new" element={<AlertForm />} />
				<Route path=":alert_id/edit" element={<AlertForm />} />
				<Route
					path="monitor"
					element={<Navigate to={`/${project_id}/alerts`} replace />}
				/>
				<Route
					path="new/logs"
					element={
						<Navigate
							to={`/${project_id}/alerts/logs/new`}
							replace
						/>
					}
				/>

				<Route
					path="new/errors"
					element={
						<Navigate
							to={`/${project_id}/alerts/errors/new`}
							replace
						/>
					}
				/>
				<Route path="session/new" element={<SessionAlertPage />} />
				<Route
					path="session/:alert_id"
					element={<SessionAlertPage />}
				/>
				<Route path="errors/new" element={<ErrorAlertPage />} />
				<Route path="errors/:alert_id" element={<ErrorAlertPage />} />
			</Routes>
		</AlertsContextProvider>
	)
}

export default AlertsRouter
