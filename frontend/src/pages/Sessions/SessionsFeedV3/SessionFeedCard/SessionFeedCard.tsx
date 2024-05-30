import { Avatar } from '@components/Avatar/Avatar'
import { SearchExpression } from '@components/Search/Parser/listener'
import { useSearchContext } from '@components/Search/SearchContext'
import { stringifyExpression } from '@components/Search/utils'
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
	Tooltip,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { sessionIsBackfilled } from '@pages/Player/utils/utils'
import ActivityGraph from '@pages/Sessions/SessionsFeedV3/ActivityGraph/ActivityGraph'
import { SessionFeedConfigurationContext } from '@pages/Sessions/SessionsFeedV3/context/SessionFeedConfigurationContext'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment/moment'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

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
		const { onSubmit, queryParts } = useSearchContext()
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

		const handleIconClick =
			(key: string, value: boolean) => (e: React.MouseEvent) => {
				e.preventDefault()

				let newQueryParts = []
				newQueryParts = queryParts.filter((part) => part.key !== key)
				newQueryParts.push({
					key,
					operator: '=',
					value: `${value}`,
					text: `${key}=${value}`,
				} as SearchExpression)

				onSubmit(stringifyExpression(newQueryParts))
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
										<Tooltip
											trigger={
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
														'has_errors',
														true,
													)}
												/>
											}
										>
											<Box padding="4">
												<Text
													size="xSmall"
													color="moderate"
												>
													Filter by sessions with
													errors
												</Text>
											</Box>
										</Tooltip>
									)}
									{session.first_time && (
										<Tooltip
											trigger={
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
														'first_time',
														true,
													)}
												/>
											}
										>
											<Box padding="4">
												<Text
													size="xSmall"
													color="moderate"
												>
													Filter by first time users
												</Text>
											</Box>
										</Tooltip>
									)}
									{session.has_rage_clicks && (
										<Tooltip
											trigger={
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
														'has_rage_click',
														true,
													)}
												/>
											}
										>
											<Box padding="4">
												<Text
													size="xSmall"
													color="moderate"
												>
													Filter by sessions with rage
													clicks
												</Text>
											</Box>
										</Tooltip>
									)}
									{!viewed && (
										<Tooltip
											maxWidth={177}
											delayed
											trigger={
												<Tag
													shape="basic"
													kind="secondary"
													emphasis="low"
													size="small"
													icon={
														<IconSolidEyeOff
															size={12}
														/>
													}
													onClick={handleIconClick(
														'viewed_by_anyone',
														false,
													)}
												/>
											}
										>
											<Box padding="4">
												<Text
													size="xSmall"
													color="moderate"
												>
													Filter by unviewed sessions
												</Text>
											</Box>
										</Tooltip>
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
										<Tooltip
											trigger={
												<Tag
													shape="basic"
													kind="primary"
													size="small"
													iconLeft={
														<IconSolidVideoCamera />
													}
													onClick={handleIconClick(
														'completed',
														false,
													)}
												>
													Live
												</Tag>
											}
										>
											<Box padding="4">
												<Text
													size="xSmall"
													color="moderate"
												>
													Filter by live sessions
												</Text>
											</Box>
										</Tooltip>
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
