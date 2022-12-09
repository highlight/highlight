import { Avatar } from '@components/Avatar/Avatar'
import { Session } from '@graph/schemas'
import {
	Box,
	IconBadgeCheck,
	IconEmojiHappy,
	IconEye,
	IconEyeOff,
	Tag,
	Text,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { useProjectId } from '@hooks/useProjectId'
import UserCross from '@icons/UserCross'
import { formatShortTime } from '@pages/Home/components/KeyPerformanceIndicators/utils/utils'
import { sessionIsBackfilled } from '@pages/Player/utils/utils'
import {
	getDisplayName,
	getIdentifiedUserProfileImage,
} from '@pages/Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils'
import { formatDatetime } from '@pages/Sessions/SessionsFeedV2/components/SessionFeedConfiguration/SessionFeedConfiguration'
import { SessionFeedConfigurationContext } from '@pages/Sessions/SessionsFeedV2/context/SessionFeedConfigurationContext'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import ActivityGraph from '../ActivityGraph/ActivityGraph'
import * as style from './SessionFeedCard.css'
interface Props {
	session: Session
	urlParams?: string
	showDetailedSessionView?: boolean
	autoPlaySessions?: boolean
	selected?: boolean
	configuration?: Pick<
		SessionFeedConfigurationContext,
		'countFormat' | 'datetimeFormat'
	>
}
export const SessionFeedCard = React.memo(
	({
		session,
		urlParams,
		showDetailedSessionView,
		autoPlaySessions,
		selected,
		configuration,
	}: Props) => {
		const ref = useRef<HTMLDivElement | null>(null)
		const { projectId } = useProjectId()
		const [eventCounts, setEventCounts] =
			useState<{ ts: number; value: number }[]>()
		const customAvatarImage = getIdentifiedUserProfileImage(session)
		const backfilled = sessionIsBackfilled(session as Session | undefined)
		const [viewed, setViewed] = useState(session.viewed || false)

		useEffect(() => {
			if (selected) {
				setViewed(true)
			}
		}, [selected])

		useEffect(() => {
			if (!!session.event_counts) {
				setEventCounts(
					JSON.parse(session.event_counts).map(
						(v: number, k: number) => {
							return { ts: k, value: v }
						},
					),
				)
			}
		}, [session.event_counts, setEventCounts])

		useEffect(() => {
			if (autoPlaySessions && selected && ref?.current) {
				ref.current.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				})
			}
		}, [autoPlaySessions, selected, session.secure_id])

		return (
			<Box ref={ref}>
				<Link
					to={`/${projectId}/sessions/${session.secure_id}${
						urlParams || ''
					}`}
				>
					<Box
						paddingTop="8"
						paddingBottom="10"
						px={`${style.SESSION_CARD_PX}`}
						borderRadius="6"
						display="flex"
						flexDirection="column"
						gap="4"
						cssClass={[
							style.sessionCard,
							{
								[style.sessionCardSelected]: selected,
							},
						]}
					>
						<Box color="dark" cssClass={style.sessionCardTitle}>
							<Box display="flex" gap="8" alignItems="center">
								<Avatar
									seed={getDisplayName(session)}
									style={{ height: 25, width: 25 }}
									customImage={customAvatarImage}
								/>
								<Text
									lines="1"
									size="small"
									color="dark"
									display="flex"
									cssClass={style.sessionCardTitleText}
								>
									{getDisplayName(session)}
								</Text>
								{backfilled && <UserCross />}
							</Box>
							<Text
								lines="1"
								size="small"
								color="neutralN9"
								display="flex"
								cssClass={style.sessionCardTitleText}
							>
								{configuration?.datetimeFormat
									? formatDatetime(
											session.created_at,
											configuration.datetimeFormat,
									  )
									: `${new Date(
											session.created_at,
									  ).toLocaleString('en-us', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
									  })}`}
							</Text>
						</Box>
						<Box
							alignItems="center"
							display="flex"
							gap="12"
							justifyContent="space-between"
						>
							<Box
								display="flex"
								flexDirection="column"
								gap="6"
								justifyContent="space-between"
							>
								<Box display="flex" gap="4" alignItems="center">
									{!session.processed && (
										<Tag
											shape="basic"
											kind="primary"
											size="small"
										>
											<Text>Live</Text>
										</Tag>
									)}
									<Tag
										shape="basic"
										kind="transparent"
										iconLeft={
											viewed ? (
												<>
													<IconEye size={12} />
												</>
											) : (
												<IconEyeOff
													color={colors.purple500}
													size={12}
												/>
											)
										}
									/>
									<Tag
										shape="basic"
										kind="transparent"
										iconLeft={<IconEmojiHappy size={12} />}
									/>
									<Tag
										shape="basic"
										kind="transparent"
										iconLeft={<IconBadgeCheck size={12} />}
									/>
								</Box>
								<Box display="flex" gap="4" alignItems="center">
									<Tag shape="basic" kind="grey">
										{formatShortTime(
											(session.active_length || 0) / 1000,
										)}
									</Tag>
								</Box>
							</Box>
							{showDetailedSessionView && eventCounts?.length && (
								<Box cssClass={style.activityGraph}>
									<ActivityGraph
										data={eventCounts}
										height={38}
									/>
								</Box>
							)}
						</Box>
					</Box>
				</Link>
			</Box>
		)
	},
)
