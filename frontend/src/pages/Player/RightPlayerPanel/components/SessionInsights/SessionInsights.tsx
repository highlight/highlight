import {
	Badge,
	Box,
	IconSolidArrowCircleRight,
	Tag,
	Text,
} from '@highlight-run/ui'

import LoadingBox from '@/components/LoadingBox'
import { useGetSessionInsightQuery } from '@/graph/generated/hooks'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@/pages/Player/ReplayerContext'
import { useParams } from '@/util/react-router/useParams'
import { playerTimeToSessionAbsoluteTime } from '@/util/session/utils'
import { MillisToMinutesAndSeconds } from '@/util/time'

import * as style from './SessionInsights.css'
interface SessionInsight {
	timestamp: number
	insight: string
}

const SessionInsights = () => {
	const { session_secure_id } = useParams<{
		session_secure_id: string
	}>()
	const {
		setTime,
		sessionMetadata: { startTime },
	} = useReplayerContext()
	const { showPlayerAbsoluteTime } = usePlayerConfiguration()

	const { data, loading } = useGetSessionInsightQuery({
		variables: {
			secure_id: session_secure_id!,
		},
		skip: !session_secure_id,
	})

	return (
		<Box py="8" display="flex" flexDirection="column">
			{loading ? (
				<LoadingBox />
			) : (
				JSON.parse(data?.session_insight?.insight || '[]').map(
					(insight: SessionInsight, idx: number) => {
						const timeSinceStart =
							new Date(insight.timestamp).getTime() - startTime
						return (
							<Box px="8" cursor="pointer" key={idx}>
								<Box
									className={style.insight}
									onClick={() => {
										setTime(timeSinceStart)
									}}
								>
									<Box display="flex" gap="4">
										<Badge
											size="small"
											variant="purple"
											label={String(idx + 1)}
										/>
										<Tag
											kind="secondary"
											size="small"
											shape="basic"
											emphasis="low"
											iconRight={
												<IconSolidArrowCircleRight />
											}
										>
											{showPlayerAbsoluteTime
												? playerTimeToSessionAbsoluteTime(
														{
															sessionStartTime:
																startTime,
															relativeTime:
																timeSinceStart,
														},
												  )
												: MillisToMinutesAndSeconds(
														timeSinceStart,
												  )}
										</Tag>
									</Box>
									<Box overflowWrap="breakWord">
										<Text
											size="small"
											weight="medium"
											color="strong"
										>
											{insight.insight}
										</Text>
									</Box>
								</Box>
							</Box>
						)
					},
				)
			)}
		</Box>
	)
}

export default SessionInsights
