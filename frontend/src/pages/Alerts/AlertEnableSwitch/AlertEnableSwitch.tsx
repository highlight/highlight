import Switch from '@components/Switch/Switch'
import { toast } from '@components/Toaster'
import {
	useUpdateAlertDisabledMutation,
	useUpdateErrorAlertIsDisabledMutation,
	useUpdateLogAlertIsDisabledMutation,
	useUpdateMetricMonitorIsDisabledMutation,
	useUpdateSessionAlertIsDisabledMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { ALERT_TYPE } from '@pages/Alerts/Alerts'
import { useParams } from '@util/react-router/useParams'
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
	const [updateAlertDisabled] = useUpdateAlertDisabledMutation()

	const onChange = async (_: boolean, e: React.MouseEvent) => {
		e.preventDefault()

		setLoading(true)
		const isDisabled = !disabled

		const type = record.configuration.type

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
			case ALERT_TYPE.Dynamic:
				await updateAlertDisabled({
					...requestBody,
					variables: {
						alert_id: record.id,
						project_id: project_id!,
						disabled: isDisabled,
					},
				})
				break
			default:
				throw new Error(`Unsupported alert type: ${type}`)
		}

		toast.success(
			isDisabled
				? `Paused "${record.name || record.Name}"`
				: `Enabled "${record.name || record.Name}"`,
			{ duration: 5000 },
		)

		setDisabled(isDisabled)
		setLoading(false)
	}

	return (
		<Switch
			trackingId="AlertDisableSwitch"
			loading={loading}
			justifySpaceBetween
			size="default"
			checked={loading ? disabled : !disabled}
			onChange={onChange}
		/>
	)
}
