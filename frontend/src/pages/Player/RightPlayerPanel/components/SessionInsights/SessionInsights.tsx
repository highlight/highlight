import {
	Badge,
	Box,
	IconSolidArrowCircleRight,
	IconSolidSparkles,
	Tag,
	Text,
} from '@highlight-run/ui'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import { Button } from '@/components/Button'
import LoadingBox from '@/components/LoadingBox'
import { useGetSessionInsightLazyQuery } from '@/graph/generated/hooks'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@/pages/Player/ReplayerContext'
import { useGlobalContext } from '@/routers/ProjectRouter/context/GlobalContext'
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
	const { showBanner } = useGlobalContext()
	const [insightData, setInsightData] = useState('')

	const [getSessionInsight, { loading }] = useGetSessionInsightLazyQuery({
		onCompleted: (data) => {
			setInsightData(data?.session_insight?.insight || '[]')
		},
	})

	useEffect(() => {
		setInsightData('')
	}, [session_secure_id])

	return (
		<Box p="8" height="full" overflow="auto">
			{loading ? (
				<LoadingBox />
			) : insightData ? (
				<Box
					cssClass={clsx(style.insightPanel, {
						[style.insightPanelWithBanner]: showBanner,
					})}
				>
					<Box
						height="full"
						width="full"
						display="flex"
						flexDirection="column"
						position="relative"
					>
						{[
							...JSON.parse(insightData),
							...JSON.parse(insightData),
						].map((insight: SessionInsight, idx: number) => {
							const timeSinceStart =
								new Date(insight.timestamp).getTime() -
								startTime
							return (
								<Box cursor="pointer" key={idx}>
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
						})}
					</Box>
				</Box>
			) : (
				<Box
					background="raised"
					height="full"
					width="full"
					display="flex"
					alignItems="center"
					justifyContent="center"
					borderRadius="6"
				>
					<Button
						trackingId="GetSessionInsight"
						onClick={() => {
							getSessionInsight({
								variables: {
									secure_id: session_secure_id!,
								},
							})
						}}
						iconLeft={<IconSolidSparkles />}
					>
						Generate summary
					</Button>
				</Box>
			)}
		</Box>
	)
}

export default SessionInsights
