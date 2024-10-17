import React, { useMemo } from 'react'
import moment from 'moment'

import * as buttonStyles from '@components/Button/style.css'
import {
	Box,
	IconSolidClock,
	IconSolidEye,
	IconSolidFire,
	IconSolidLoading,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { AlertState, AlertStateChange } from '@/graph/generated/schemas'

type Props = {
	alertStateChanges?: AlertStateChange[]
	totalAlerts?: number
	loading?: boolean
	totalAlertsLoading?: boolean
}

export const AlertInfo: React.FC<Props> = ({
	alertStateChanges = [],
	totalAlerts = 0,
	loading,
	totalAlertsLoading,
}) => {
	const currentAlertCount = useMemo(() => {
		return alertStateChanges.reduce((acc, change) => {
			if (
				change.state === AlertState.Alerting ||
				change.state === AlertState.AlertingSilently
			) {
				acc += 1
			}
			return acc
		}, 0)
	}, [alertStateChanges])

	const lastEvaluated = useMemo(() => {
		const lastTime = alertStateChanges[0]?.timestamp

		if (!lastTime) {
			return 'N/A'
		}

		return moment(lastTime).fromNow()
	}, [alertStateChanges])

	return (
		<Box
			display="flex"
			gap="4"
			border="dividerWeak"
			borderRadius="8"
			justifyContent="space-between"
		>
			<AlertInfoBox
				label="Active Alerts"
				value={currentAlertCount}
				icon={<IconSolidFire />}
				borderRight
				loading={loading}
			/>
			<AlertInfoBox
				label="Last Checked"
				value={lastEvaluated}
				icon={<IconSolidEye />}
				borderRight
				loading={loading}
			/>
			<AlertInfoBox
				label="Alerts in Timeframe"
				value={totalAlerts}
				icon={<IconSolidClock />}
				loading={totalAlertsLoading}
			/>
		</Box>
	)
}

type AlertInfoBoxProps = {
	label: string
	value: string | number
	icon: JSX.Element
	borderRight?: boolean
	loading?: boolean
}

const AlertInfoBox: React.FC<AlertInfoBoxProps> = ({
	label,
	value,
	icon,
	borderRight,
	loading,
}) => {
	return (
		<Stack
			display="flex"
			gap="12"
			p="12"
			width="full"
			borderRight={borderRight ? 'dividerWeak' : undefined}
		>
			<Box display="flex" gap="4" alignItems="center" color="moderate">
				{icon}
				<Text>{label}</Text>
			</Box>
			<Box display="flex">
				<Text color="strong" weight="bold">
					{loading ? (
						<IconSolidLoading
							className={buttonStyles.loadingIcon}
						/>
					) : (
						value
					)}
				</Text>
			</Box>
		</Stack>
	)
}
