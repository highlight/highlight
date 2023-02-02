import LoadingBox from '@components/LoadingBox'
import { ErrorGroup, Maybe } from '@graph/schemas'
import {
	Box,
	IconSolidTrendingDown,
	IconSolidTrendingUp,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui'
import { showChangeThresholdPercent } from '@pages/ErrorsV2/ErrorBody/ErrorBody'
import { getErrorGroupStats } from '@pages/ErrorsV2/utils'
import moment from 'moment'
import React from 'react'

interface Props {
	errorGroup?: Maybe<Omit<ErrorGroup, 'metadata_log'>>
}

const AffectedUserCount = ({ errorGroup }: Props) => {
	if (!errorGroup) return <LoadingBox />

	const { startDate, weekly, userCount } = getErrorGroupStats(errorGroup)

	const usersChange = weekly.users[0]
		? ((weekly.users[1] - weekly.users[0]) / weekly.users[0]) * 100
		: 0

	const numberOfDays = moment(moment()).diff(startDate, 'days')

	return (
		<Box gap="8" display="flex" alignItems="center">
			<Text color="black" size="large" weight="bold">
				{userCount}
			</Text>
			{Math.abs(usersChange) > showChangeThresholdPercent &&
			numberOfDays >= 1 ? (
				<Tooltip
					trigger={
						<Tag
							kind="secondary"
							shape="basic"
							iconLeft={
								usersChange > 0 ? (
									<IconSolidTrendingUp />
								) : (
									<IconSolidTrendingDown />
								)
							}
						>
							{usersChange > 0 ? '+' : ''}
							{usersChange.toFixed(0)}%
						</Tag>
					}
				>
					<Box display="flex" alignItems="center" gap="4">
						<Text color="n9" size="xSmall">
							since
						</Text>
						<Box
							borderRadius="3"
							p="4"
							boxShadow="small"
							style={{
								margin: -1,
							}}
						>
							<Text size="xSmall" color="n11">
								{numberOfDays}{' '}
								{numberOfDays === 1 ? 'day' : 'days'}
							</Text>
						</Box>
					</Box>
				</Tooltip>
			) : null}
		</Box>
	)
}

export default AffectedUserCount
