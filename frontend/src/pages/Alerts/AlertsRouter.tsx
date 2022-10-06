import Breadcrumb from '@components/Breadcrumb/Breadcrumb'
import { getSlackUrl } from '@components/Header/components/PersonalNotificationButton/utils/utils'
import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import { useGetAlertsPagePayloadQuery } from '@graph/hooks'
import { GetAlertsPagePayloadQuery } from '@graph/operations'
import AlertsPage from '@pages/Alerts/Alerts'
import { AlertsContextProvider } from '@pages/Alerts/AlertsContext/AlertsContext'
import EditAlertsPage from '@pages/Alerts/EditAlertsPage'
import EditMonitorPage from '@pages/Alerts/EditMonitorPage'
import NewAlertPage from '@pages/Alerts/NewAlertPage'
import NewMonitorPage from '@pages/Alerts/NewMonitorPage'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

const AlertsRouter = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const [alertsPayload, setAlertsPayload] = useState<
		GetAlertsPagePayloadQuery | undefined
	>(undefined)
	const { data, loading } = useGetAlertsPagePayloadQuery({
		variables: { project_id },
	})
	const slackUrl = getSlackUrl('Organization', project_id)
	const location = useLocation()

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
			<LeadAlignLayout maxWidth={1200}>
				<Breadcrumb
					getBreadcrumbName={(url) =>
						getAlertsBreadcrumbNames(location.state)(url)
					}
					linkRenderAs="h2"
				/>
				<Routes>
					<Route path={'*'} element={<AlertsPage />} />
					<Route path={`new`} element={<NewAlertPage />} />
					<Route
						path={`monitor`}
						element={<Navigate to={`/${project_id}/alerts`} />}
					/>
					<Route
						path={`new/monitor`}
						element={
							<NewMonitorPage
								channelSuggestions={
									data?.slack_channel_suggestion || []
								}
								isSlackIntegrated={
									data?.is_integrated_with_slack || false
								}
								emailSuggestions={(data?.admins || []).map(
									(wa) => wa.admin!.email,
								)}
							/>
						}
					/>
					<Route
						path={`monitor/:id`}
						element={
							<EditMonitorPage
								channelSuggestions={
									data?.slack_channel_suggestion || []
								}
								isSlackIntegrated={
									data?.is_integrated_with_slack || false
								}
								emailSuggestions={(data?.admins || []).map(
									(wa) => wa.admin!.email,
								)}
							/>
						}
					/>
					<Route path={`new/:type`} element={<NewAlertPage />} />
					<Route path={`:id`} element={<EditAlertsPage />} />
				</Routes>
			</LeadAlignLayout>
		</AlertsContextProvider>
	)
}

export default AlertsRouter

const getAlertsBreadcrumbNames = (suffixes: { [key: string]: string }) => {
	return (url: string) => {
		if (url.endsWith('/alerts')) {
			return 'Alerts'
		}

		if (url.endsWith('/monitor')) {
			return 'Metric Monitor'
		}

		if (url.endsWith('/alerts/new')) {
			return 'Create'
		}

		if (url.includes('/alerts/new/')) {
			return `${suffixes?.errorName}`
		}

		return `Edit ${suffixes?.errorName || ''}`
	}
}
