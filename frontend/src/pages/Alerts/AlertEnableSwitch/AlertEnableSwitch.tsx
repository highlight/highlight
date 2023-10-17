import Switch from '@components/Switch/Switch'
import {
	useUpdateErrorAlertIsDisabledMutation,
	useUpdateLogAlertIsDisabledMutation,
	useUpdateMetricMonitorIsDisabledMutation,
	useUpdateSessionAlertIsDisabledMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { ALERT_TYPE } from '@pages/Alerts/Alerts'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React, { useState } from 'react'

export const AlertEnableSwitch: React.FC<
	React.PropsWithChildren<{ record: any }>
> = ({ record }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const [loading, setLoading] = useState<boolean>(false)
	const [disabled, setDisabled] = useState<boolean>(record.disabled ?? false)
	const [updateSessionAlertIsDisabled] =
		useUpdateSessionAlertIsDisabledMutation()
	const [updateErrorAlertIsDisabled] = useUpdateErrorAlertIsDisabledMutation()
	const [updateMetricMonitorIsDisabled] =
		useUpdateMetricMonitorIsDisabledMutation()
	const [updateLogAlertIsDisabled] = useUpdateLogAlertIsDisabledMutation()

	const onChange = async () => {
		setLoading(true)
		const isDisabled = !disabled

		const type = record.configuration.type
		console.log(record)

		const requestBody = {
			refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
		}

		switch (type) {
			case ALERT_TYPE.FirstTimeUser:
			case ALERT_TYPE.UserProperties:
			case ALERT_TYPE.TrackProperties:
			case ALERT_TYPE.NewSession:
			case ALERT_TYPE.RageClick:
				await updateSessionAlertIsDisabled({
					...requestBody,
					variables: {
						id: record.id,
						project_id: project_id!,
						disabled: isDisabled,
					},
				})
				break
			case ALERT_TYPE.Error:
				await updateErrorAlertIsDisabled({
					...requestBody,
					variables: {
						id: record.id,
						project_id: project_id!,
						disabled: isDisabled,
					},
				})
				break
			case ALERT_TYPE.MetricMonitor:
				await updateMetricMonitorIsDisabled({
					...requestBody,
					variables: {
						id: record.id,
						project_id: project_id!,
						disabled: isDisabled,
					},
				})
				break
			case ALERT_TYPE.Logs:
				await updateLogAlertIsDisabled({
					...requestBody,
					variables: {
						id: record.id,
						project_id: project_id!,
						disabled: isDisabled,
					},
				})
				break
			default:
				throw new Error(`Unsupported alert type: ${type}`)
		}

		message.success(
			isDisabled
				? `Disabled "${record.Name}"`
				: `Enabled "${record.Name}"`,
			5,
		)

		setDisabled(isDisabled)
		setLoading(false)
	}

	return (
		<Switch
			trackingId={`AlertEnable-${record.id}`}
			loading={loading}
			justifySpaceBetween
			size="default"
			checked={loading ? disabled : !disabled}
			onChange={onChange}
		/>
	)
}
