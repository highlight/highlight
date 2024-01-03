import LoadingBox from '@components/LoadingBox'
import { Box, Preset, Stack, Text } from '@highlight-run/ui/components'
import { formatDate } from '@pages/LogsPage/utils'
import { formatNumber } from '@util/numbers'
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
	presets: Preset[]
	totalCount: number | undefined
	loading: boolean
}) => {
	const dateLabel = useMemo(() => {
		const isPreset = presets.find((preset) => {
			return preset.startDate.getTime() === startDate.getTime()
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
