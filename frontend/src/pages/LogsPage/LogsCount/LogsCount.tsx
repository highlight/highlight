import { useGetLogsTotalCountQuery } from '@graph/hooks'
import { Box, Preset, Stack, Text } from '@highlight-run/ui'
import { useNumericProjectId } from '@hooks/useProjectId'
import { LOG_TIME_FORMAT } from '@pages/LogsPage/constants'
import { formatDate } from '@pages/LogsPage/utils'
import { formatNumber } from '@util/numbers'
import moment from 'moment'
import { useMemo } from 'react'

import * as styles from './LogsCount.css'

const LogsCount = ({
	query,
	startDate,
	endDate,
	presets,
}: {
	query: string
	startDate: Date
	endDate: Date
	presets: Preset[]
}) => {
	const { projectId } = useNumericProjectId()
	const { data: totalCount, loading: logCountLoading } =
		useGetLogsTotalCountQuery({
			variables: {
				project_id: projectId!,
				params: {
					query,
					date_range: {
						start_date: moment(startDate).format(LOG_TIME_FORMAT),
						end_date: moment(endDate).format(LOG_TIME_FORMAT),
					},
				},
			},
			skip: !projectId,
		})

	const dateLabel = useMemo(() => {
		const isPreset = presets.find((preset) => {
			return preset.startDate.getTime() === startDate.getTime()
		})
		if (isPreset) {
			return `${formatDate(startDate)} to Now`
		}
		return `${formatDate(startDate)} to ${formatDate(endDate)}`
	}, [endDate, presets, startDate])

	return (
		<Stack
			direction="row"
			gap="8"
			px="12"
			py="8"
			align="center"
			cssClass={styles.container}
		>
			{logCountLoading ? (
				<Text size="xSmall" color="weak">
					Loading...
				</Text>
			) : (
				totalCount && (
					<>
						<Text size="xSmall" color="weak">
							{formatNumber(totalCount.logs_total_count)} logs
						</Text>
						<Box br="dividerWeak" height="full" />
						<Text size="xSmall" color="weak">
							{dateLabel}
						</Text>
					</>
				)
			)}
		</Stack>
	)
}

export default LogsCount
