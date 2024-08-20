import {
	Badge,
	Box,
	IconSolidArrowCircleRight,
	IconSolidSparkles,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import { Button } from '@/components/Button'
import { useGetSessionInsightLazyQuery } from '@/graph/generated/hooks'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@/pages/Player/ReplayerContext'
import { useSessionParams } from '@/pages/Sessions/utils'
import { useGlobalContext } from '@/routers/ProjectRouter/context/GlobalContext'
import { playerTimeToSessionAbsoluteTime } from '@/util/session/utils'
import { MillisToMinutesAndSeconds } from '@/util/time'

import * as style from './SessionInsights.css'
interface SessionInsight {
	timestamp: number
	insight: string
}

const SessionInsights = () => {
	const { sessionSecureId } = useSessionParams()
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
	}, [sessionSecureId])

	return (
		<Box p="8" height="full" overflow="auto">
			{loading ? (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					style={{
						height: '100%',
						width: '100%',
					}}
				>
					<Button
						kind="secondary"
						emphasis="low"
						loading
						trackingId="loading"
					>
						Harold is thinking...
					</Button>
				</Box>
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
						{[...JSON.parse(insightData)].map(
							(insight: SessionInsight, idx: number) => {
								const timeSinceStart = Math.max(
									new Date(insight.timestamp).getTime() -
										startTime,
									0,
								)
								return (
									<Box cursor="pointer" key={idx}>
										<Box
											cssClass={style.insight}
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
						)}
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
									secure_id: sessionSecureId!,
								},
							})
						}}
						iconLeft={<IconSolidSparkles />}
					>
						Summarize session
					</Button>
				</Box>
			)}
		</Box>
	)
}

export default SessionInsights
