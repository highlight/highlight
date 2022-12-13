import Breadcrumb from '@components/Breadcrumb/Breadcrumb'
import { getSlackUrl } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import { useGetAlertsPagePayloadQuery } from '@graph/hooks'
import { GetAlertsPagePayloadQuery } from '@graph/operations'
import AlertsPage from '@pages/Alerts/Alerts'
import { AlertsContextProvider } from '@pages/Alerts/AlertsContext/AlertsContext'
import EditAlertsPage from '@pages/Alerts/EditAlertsPage'
import EditMonitorPage from '@pages/Alerts/EditMonitorPage'
import NewAlertPage from '@pages/Alerts/NewAlertPage'
import NewMonitorPage from '@pages/Alerts/NewMonitorPage'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import {
	Redirect,
	Route,
	Switch,
	useHistory,
	useRouteMatch,
} from 'react-router-dom'

const AlertsRouter = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { path } = useRouteMatch()
	const [alertsPayload, setAlertsPayload] = useState<
		GetAlertsPagePayloadQuery | undefined
	>(undefined)
	const { data, loading } = useGetAlertsPagePayloadQuery({
		variables: { project_id },
	})
	const slackUrl = getSlackUrl(project_id)
	const history = useHistory<{ errorName: string }>()

	useEffect(() => {
		if (!loading) {
			setAlertsPayload(data)
		}
	}, [data, loading])

	useEffect(() => analytics.page(), [])

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
						getAlertsBreadcrumbNames(history.location.state)(url)
					}
					linkRenderAs="h2"
				/>
				<Switch>
					<Route exact path={path}>
						<AlertsPage />
					</Route>
					<Route exact path={`${path}/new`}>
						<NewAlertPage />
					</Route>
					<Route exact path={`${path}/monitor`}>
						<Redirect to={`/${project_id}/alerts`} />
					</Route>
					<Route exact path={`${path}/new/monitor`}>
						<NewMonitorPage
							channelSuggestions={
								data?.slack_channel_suggestion || []
							}
							discordChannelSuggestions={
								data?.discord_channel_suggestions || []
							}
							isSlackIntegrated={
								data?.is_integrated_with_slack || false
							}
							isDiscordIntegrated={
								data?.is_integrated_with_discord || false
							}
							emailSuggestions={(data?.admins || []).map(
								(wa) => wa.admin!.email,
							)}
						/>
					</Route>
					<Route exact path={`${path}/monitor/:id`}>
						<EditMonitorPage
							channelSuggestions={
								data?.slack_channel_suggestion || []
							}
							discordChannelSuggestions={
								data?.discord_channel_suggestions || []
							}
							isSlackIntegrated={
								data?.is_integrated_with_slack || false
							}
							isDiscordIntegrated={
								data?.is_integrated_with_discord || false
							}
							emailSuggestions={(data?.admins || []).map(
								(wa) => wa.admin!.email,
							)}
						/>
					</Route>
					<Route exact path={`${path}/new/:type`}>
						<NewAlertPage />
					</Route>
					<Route path={`${path}/:id`}>
						<EditAlertsPage />
					</Route>
				</Switch>
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
