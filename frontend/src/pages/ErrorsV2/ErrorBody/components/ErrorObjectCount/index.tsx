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

const ErrorObjectCount = ({ errorGroup }: Props) => {
	const { weekly, totalCount } = getErrorGroupStats(errorGroup)
	const countChange = weekly.count[0]
		? ((weekly.count[1] - weekly.count[0]) / weekly.count[0]) * 100
		: 0

	return (
		<Box display="flex" gap="8" alignItems="center">
			<Text color="black" size="large" weight="bold">
				{totalCount}
			</Text>
			{Math.abs(countChange) > showChangeThresholdPercent && (
				<Tooltip
					trigger={
						<Tag
							kind="secondary"
							shape="basic"
							iconLeft={
								countChange > 0 ? (
									<IconSolidTrendingUp size={12} />
								) : (
									<IconSolidTrendingDown size={12} />
								)
							}
						>
							<>
								{countChange > 0 ? '+' : ''}
								{countChange.toFixed(0)}%
							</>
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

export default ErrorObjectCount
