import LoadingBox from '@components/LoadingBox'
import { Box, Stack, Text, TimePreset } from '@highlight-run/ui/components'
import { formatDate } from '@pages/LogsPage/utils'
import { formatNumber } from '@util/numbers'
import moment from 'moment'
import { useMemo } from 'react'

const LogsCount = ({
	startDate,
	endDate,
	presets,
	totalCount,
	loading,
}: {
	startDate: Date
	endDate: Date
	presets: TimePreset[]
	totalCount: number | undefined
	loading: boolean
}) => {
	const dateLabel = useMemo(() => {
		const isPreset = presets.find((preset) => {
			const presetDate = moment()
				.subtract(preset.quantity, preset.unit)
				.toDate()
			return presetDate.getTime() === startDate.getTime()
		})
		if (isPreset) {
			return `${formatDate(startDate)} to Now`
		}
		return `${formatDate(startDate)} to ${formatDate(endDate)}`
	}, [endDate, presets, startDate])

	if (loading) {
		return (
			<Box>
				<LoadingBox justifyContent="flex-start" size="xSmall" />
			</Box>
		)
	}

	return (
		<Stack direction="row" gap="8" p="8" align="center">
			{totalCount !== undefined ? (
				<>
					<Box display="flex" gap="4" flexDirection="row">
						<Text size="xSmall" color="strong">
							Logs
						</Text>
						<Text size="xSmall" color="weak">
							{formatNumber(totalCount)} total
						</Text>
					</Box>
					<Box br="dividerWeak" height="full" />
					<Text size="xSmall" color="weak">
						{dateLabel}
					</Text>
				</>
			) : null}
		</Stack>
	)
}

export default LogsCount
