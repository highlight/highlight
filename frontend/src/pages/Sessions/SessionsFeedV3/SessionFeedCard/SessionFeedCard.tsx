import { Avatar } from '@components/Avatar/Avatar'
import { useSearchContext } from '@components/Search/SearchContext'
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
import ActivityGraph from '@pages/Sessions/SessionsFeedV3/ActivityGraph/ActivityGraph'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment/moment'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { SessionFeedConfigurationContext } from '@/pages/Sessions/SessionsFeedV3/context/SessionFeedConfigurationContext'

import {
	getDisplayName,
	getIdentifiedUserProfileImage,
} from '../MinimalSessionCard/utils/utils'
import { formatDatetime } from '../SessionFeedConfigDropdown/helpers'
import * as style from './SessionFeedCard.css'
interface Props {
	session: Session
	configuration?: Pick<
		SessionFeedConfigurationContext,
		'countFormat' | 'datetimeFormat'
	>
}
export const SessionFeedCard = React.memo(
	({ session, configuration }: Props) => {
		const { session_secure_id } = useParams<{
			project_id: string
			session_secure_id: string
		}>()
		const ref = useRef<HTMLDivElement | null>(null)
		const { projectId } = useProjectId()
		const { onSubmit } = useSearchContext()
		const [eventCounts, setEventCounts] =
			useState<{ ts: number; value: number }[]>()
		const customAvatarImage = getIdentifiedUserProfileImage(session)
		const backfilled = sessionIsBackfilled(session as Session | undefined)
		const [viewed, setViewed] = useState(session.viewed || false)
		const { autoPlaySessions, showDetailedSessionView } =
			usePlayerConfiguration()

		const selected = session?.secure_id === session_secure_id

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

		const handleIconClick = (query: string) => (e: React.MouseEvent) => {
			e.preventDefault()
			onSubmit(query)
		}

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
											onClick={handleIconClick(
												'has_errors=true',
											)}
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
											onClick={handleIconClick(
												'first_time=true',
											)}
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
											onClick={handleIconClick(
												'has_rage_clicks=true',
											)}
										/>
									)}
									{!viewed && (
										<Tag
											shape="basic"
											kind="secondary"
											emphasis="low"
											size="small"
											icon={<IconSolidEyeOff size={12} />}
											onClick={handleIconClick(
												'viewed=false',
											)}
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
											onClick={handleIconClick(
												'processed=false',
											)}
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
