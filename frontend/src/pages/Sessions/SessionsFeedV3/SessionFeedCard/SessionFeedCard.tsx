import { Avatar } from '@components/Avatar/Avatar'
import { Session } from '@graph/schemas'
import {
	Box,
	IconSolidCursorClick,
	IconSolidEyeOff,
	IconSolidLightningBolt,
	IconSolidUserCircle,
	IconSolidUsers,
	IconSolidVideoCamera,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import { sessionIsBackfilled } from '@pages/Player/utils/utils'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import ActivityGraph from '@pages/Sessions/SessionsFeedV3/ActivityGraph/ActivityGraph'
import { formatDatetime } from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/components/SessionFeedConfiguration/SessionFeedConfiguration'
import { SessionFeedConfigurationContext } from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/context/SessionFeedConfigurationContext'
import moment from 'moment/moment'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { buildQueryStateString } from '@/util/url/params'

import {
	getDisplayName,
	getIdentifiedUserProfileImage,
} from '../MinimalSessionCard/utils/utils'
import * as style from './SessionFeedCard.css'
interface Props {
	session: Session
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
		showDetailedSessionView,
		autoPlaySessions,
		selected,
		configuration,
	}: Props) => {
		const ref = useRef<HTMLDivElement | null>(null)
		const { projectId } = useProjectId()
		const { setSearchQuery } = useSearchContext()
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
					to={{
						pathname: `/${projectId}/sessions/${session.secure_id}`,
						search: location.search,
					}}
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
						<Box color="strong" cssClass={style.sessionCardTitle}>
							<Box
								display="inline-flex"
								gap="6"
								alignItems="center"
							>
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

							<Avatar
								seed={getDisplayName(session)}
								style={{ height: 20, width: 20 }}
								customImage={customAvatarImage}
							/>
						</Box>
						<Box
							alignItems="center"
							display="flex"
							gap="12"
							justifyContent="space-between"
							cssClass={style.sessionMeta}
						>
							<Box
								display="flex"
								flexDirection="column"
								gap="4"
								justifyContent="space-between"
							>
								<Box
									display="flex"
									gap="4"
									alignItems="center"
									style={{ minHeight: 18 }}
								>
									{session.has_errors && (
										<Tag
											shape="basic"
											kind="secondary"
											emphasis="low"
											size="small"
											icon={
												<IconSolidLightningBolt
													size={12}
												/>
											}
										/>
									)}
									{session.first_time && (
										<Tag
											shape="basic"
											kind="secondary"
											emphasis="low"
											size="small"
											icon={
												<IconSolidUserCircle
													size={12}
												/>
											}
											onClick={() => {
												setSearchQuery(
													buildQueryStateString({
														custom_first_time: true,
													}),
												)
											}}
										/>
									)}
									{session.has_rage_clicks && (
										<Tag
											shape="basic"
											kind="secondary"
											emphasis="low"
											size="small"
											icon={
												<IconSolidCursorClick
													size={12}
												/>
											}
										/>
									)}
									{!viewed && (
										<Tag
											shape="basic"
											kind="secondary"
											emphasis="low"
											size="small"
											icon={<IconSolidEyeOff size={12} />}
											onClick={() => {
												setSearchQuery(
													buildQueryStateString({
														custom_viewed: false,
													}),
												)
											}}
										/>
									)}
								</Box>
								<Box display="flex" gap="4" alignItems="center">
									{session.processed ? (
										<Tag
											shape="basic"
											kind="secondary"
											size="small"
										>
											{moment
												.utc(session.active_length)
												.format('H:mm:ss')}
										</Tag>
									) : (
										<Tag
											shape="basic"
											kind="primary"
											size="small"
											iconLeft={<IconSolidVideoCamera />}
											onClick={() => {
												setSearchQuery(
													buildQueryStateString({
														custom_processed: false,
													}),
												)
											}}
										>
											Live
										</Tag>
									)}
									<Tag
										size="small"
										kind="secondary"
										emphasis="low"
										shape="basic"
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
									</Tag>
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
