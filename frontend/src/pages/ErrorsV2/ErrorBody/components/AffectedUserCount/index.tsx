import LoadingBox from '@components/LoadingBox'
import { ErrorGroup, Maybe } from '@graph/schemas'
import {
	Box,
	IconSolidTrendingDown,
	IconSolidTrendingUp,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { showChangeThresholdPercent } from '@pages/ErrorsV2/ErrorBody/ErrorBody'
import { getErrorGroupStats } from '@pages/ErrorsV2/utils'

interface Props {
	errorGroup?: Maybe<Omit<ErrorGroup, 'metadata_log'>>
}

const AffectedUserCount = ({ errorGroup }: Props) => {
	if (!errorGroup) return <LoadingBox />

	const { weekly, userCount } = getErrorGroupStats(errorGroup)

	const usersChange = weekly.users[0]
		? ((weekly.users[1] - weekly.users[0]) / weekly.users[0]) * 100
		: 0

	return (
		<Box gap="8" display="flex" alignItems="center">
			<Text color="black" size="large" weight="bold">
				{userCount}
			</Text>
			{Math.abs(usersChange) > showChangeThresholdPercent && (
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
							weekly change
						</Text>
					</Box>
				</Tooltip>
			)}
		</Box>
	)
}

export default AffectedUserCount
