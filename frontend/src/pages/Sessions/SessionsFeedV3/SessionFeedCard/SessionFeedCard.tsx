import { Avatar } from '@components/Avatar/Avatar'
import { Session } from '@graph/schemas'
import {
	Box,
	IconSolidCursorClick,
	IconSolidExclamation,
	IconSolidEyeOff,
	IconSolidUserCircle,
	IconSolidUsers,
	Tag,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import { sessionIsBackfilled } from '@pages/Player/utils/utils'
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import {
	getDisplayName,
	getIdentifiedUserProfileImage,
} from '@pages/Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils'
import { formatDatetime } from '@pages/Sessions/SessionsFeedV2/components/SessionFeedConfiguration/SessionFeedConfiguration'
import { SessionFeedConfigurationContext } from '@pages/Sessions/SessionsFeedV2/context/SessionFeedConfigurationContext'
import moment from 'moment/moment'
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
		const { setSearchParams } = useSearchContext()
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

		const { setRightPanelView } = usePlayerUIContext()

		return (
			<Box ref={ref}>
				<Link
					to={`/${projectId}/sessions/${session.secure_id}${
						urlParams || ''
					}`}
					onClick={() => {
						setRightPanelView(RightPanelView.Session)
					}}
				>
					<Box
						paddingTop="8"
						paddingBottom="10"
						px={`${style.SESSION_CARD_PX}`}
						borderRadius="6"
						display="flex"
						flexDirection="column"
						cssClass={[
							style.sessionCard,
							{
								[style.sessionCardSelected]: selected,
							},
						]}
					>
						<Box color="n11" cssClass={style.sessionCardTitle}>
							<Box
								display="inline-flex"
								gap="6"
								alignItems="center"
							>
								<Avatar
									seed={getDisplayName(session)}
									style={{ height: 20, width: 20 }}
									customImage={customAvatarImage}
								/>
								<Text
									lines="1"
									size="small"
									color="black"
									cssClass={style.sessionCardTitleText}
								>
									{getDisplayName(session)}
								</Text>
								{backfilled && (
									<Tag
										shape="basic"
										kind="secondary"
										emphasis="low"
										size="small"
										iconLeft={<IconSolidUsers size={12} />}
									/>
								)}
							</Box>
							{!session.processed && (
								<Tag
									shape="basic"
									kind="primary"
									size="small"
									emphasis="low"
									onClick={() => {
										setSearchParams({
											...EmptySessionsSearchParams,
											show_live_sessions: true,
										})
									}}
								>
									Live
								</Tag>
							)}
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
								gap="4"
								justifyContent="space-between"
							>
								<Box display="flex" gap="4" alignItems="center">
									{!viewed && (
										<Tag
											shape="basic"
											kind="secondary"
											emphasis="low"
											size="small"
											iconLeft={
												<IconSolidEyeOff size={12} />
											}
											onClick={() => {
												setSearchParams({
													...EmptySessionsSearchParams,
													hide_viewed: true,
												})
											}}
										/>
									)}
									{session.first_time && (
										<Tag
											shape="basic"
											kind="secondary"
											emphasis="low"
											size="small"
											iconLeft={
												<IconSolidUserCircle
													size={12}
												/>
											}
											onClick={() => {
												setSearchParams({
													...EmptySessionsSearchParams,
													first_time: true,
												})
											}}
										/>
									)}
									{session.has_errors && (
										<Tag
											shape="basic"
											kind="secondary"
											emphasis="low"
											size="small"
											iconLeft={
												<IconSolidExclamation
													size={12}
												/>
											}
										/>
									)}
									{session.has_rage_clicks && (
										<Tag
											shape="basic"
											kind="secondary"
											emphasis="low"
											size="small"
											iconLeft={
												<IconSolidCursorClick
													size={12}
												/>
											}
										/>
									)}
								</Box>
								<Box display="flex" gap="4" alignItems="center">
									<Tag
										shape="basic"
										kind="secondary"
										size="small"
									>
										<Text
											lines="1"
											size="small"
											display="flex"
										>
											{moment
												.utc(session.active_length)
												.format('HH:mm:ss')}
										</Text>
									</Tag>
									<Text
										lines="1"
										size="small"
										display="flex"
										cssClass={style.datetimeText}
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
							</Box>
							{showDetailedSessionView && eventCounts?.length && (
								<Box cssClass={style.activityGraph}>
									<ActivityGraph
										selected={selected}
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
