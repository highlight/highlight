import LoadingBox from '@components/LoadingBox'
import { Box, Preset, Stack, Text } from '@highlight-run/ui'
import { formatDate } from '@pages/LogsPage/utils'
import { formatNumber } from '@util/numbers'
import { useMemo } from 'react'

import * as styles from './LogsCount.css'

const LogsCount = ({
	startDate,
	endDate,
	presets,
	totalCount,
	logCountLoading,
}: {
	startDate: Date
	endDate: Date
	presets: Preset[]
	totalCount: number | undefined
	logCountLoading: boolean
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

	if (logCountLoading) {
		return (
			<Box px="12" py="2">
				<LoadingBox justifyContent="flex-start" />
			</Box>
		)
	}

	return (
		<Stack direction="row" gap="8" px="12" py="8" align="center">
			{totalCount !== undefined ? (
				<>
					<Text
						size="xSmall"
						color="weak"
						cssClass={styles.countText}
					>
						{formatNumber(totalCount)} logs
					</Text>
					<Box br="dividerWeak" height="full" />
					<Text
						size="xSmall"
						color="weak"
						cssClass={styles.countText}
					>
						{dateLabel}
					</Text>
				</>
			) : null}
		</Stack>
	)
}

export default LogsCount
