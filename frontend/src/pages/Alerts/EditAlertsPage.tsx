import {
	useDeleteErrorAlertMutation,
	useDeleteSessionAlertMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { AlertConfigurationCard } from '@pages/Alerts/AlertConfigurationCard/AlertConfigurationCard'
import { ALERT_CONFIGURATIONS, ALERT_TYPE } from '@pages/Alerts/Alerts'
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router-dom'

import { findAlert } from '@/pages/Alerts/utils/AlertsUtils'

const EditAlertsPage = () => {
	const { id, project_id } = useParams<{ id: string; project_id: string }>()
	const { slackUrl, alertsPayload, loading } = useAlertsContext()

	const alert = id ? findAlert(id, alertsPayload) : undefined
	const [deleteErrorAlert, {}] = useDeleteErrorAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})
	const navigate = useNavigate()
	const [deleteSessionAlert, {}] = useDeleteSessionAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
		update(cache, data) {
			const normalizedId = cache.identify({
				id: data.data?.deleteSessionAlert?.id,
				__typename: data.data?.__typename,
			})
			cache.evict({ id: normalizedId })
			cache.gc()
		},
	})

	useEffect(() => {
		if (
			alert?.Type &&
			ALERT_CONFIGURATIONS[alert?.Type].type === ALERT_TYPE.Error
		) {
			navigate(`/${project_id}/alerts/errors/${id}`)
		}
	}, [alert?.Type, id, navigate, project_id])

	return (
		<>
			<Helmet>
				<title>Edit Alert: {alert?.Name || ''}</title>
			</Helmet>
			{loading || !alertsPayload || !alert ? (
				<>
					<Skeleton
						count={1}
						height="18px"
						style={{ marginTop: 12, marginBottom: 32 }}
					/>
					<Skeleton
						count={1}
						height="600px"
						width="100%"
						style={{ borderRadius: 8 }}
					/>
				</>
			) : (
				<AlertConfigurationCard
					alert={alert}
					slackUrl={slackUrl}
					channelSuggestions={
						alertsPayload?.slack_channel_suggestion || []
					}
					discordChannelSuggestions={
						alertsPayload.discord_channel_suggestions
					}
					environmentOptions={
						alertsPayload?.environment_suggestion || []
					}
					isSlackIntegrated={
						alertsPayload?.is_integrated_with_slack || false
					}
					isDiscordIntegrated={
						alertsPayload.is_integrated_with_discord
					}
					emailSuggestions={(alertsPayload?.admins || []).map(
						(wa) => wa.admin!.email,
					)}
					//     @ts-expect-error
					configuration={ALERT_CONFIGURATIONS[alert?.Type]}
					onDeleteHandler={(alertId) => {
						if (!alert) {
							return
						}
						if (project_id) {
							if (alert?.Type === 'ERROR_ALERT') {
								deleteErrorAlert({
									variables: {
										error_alert_id: alertId,
										project_id: project_id,
									},
								})
							} else {
								deleteSessionAlert({
									variables: {
										session_alert_id: alertId,
										project_id: project_id,
									},
								})
							}
						}
						message.success(`Deleted ${alert.Name} alert.`)
						navigate(`/${project_id}/alerts`)
					}}
				/>
			)}
		</>
	)
}

export default EditAlertsPage
