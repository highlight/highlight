import { Avatar } from '@components/Avatar/Avatar'
import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import Tooltip from '@components/Tooltip/Tooltip'
import { Session } from '@graph/schemas'
import SvgBugIcon from '@icons/BugIcon'
import SvgCursorClickIcon from '@icons/CursorClickIcon'
import SvgEyeOffIcon from '@icons/EyeOffIcon'
import UserCross from '@icons/UserCross'
import { ALERT_CONFIGURATIONS } from '@pages/Alerts/Alerts'
import { formatShortTime } from '@pages/Home/components/KeyPerformanceIndicators/utils/utils'
import { sessionIsBackfilled } from '@pages/Player/utils/utils'
import { LIVE_SEGMENT_ID } from '@pages/Sessions/SearchSidebar/SegmentPicker/SegmentPicker'
import { useParams } from '@util/react-router/useParams'
import { MillisToMinutesAndSecondsVerbose } from '@util/time'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import TextTransition from 'react-text-transition'

import ActivityGraph from '../ActivityGraph/ActivityGraph'
import { SessionFeedConfigurationContext } from '../context/SessionFeedConfigurationContext'
import { formatDatetime } from '../SessionFeedConfigDropdown/helpers'
import styles from './MinimalSessionCard.module.css'
import { getDisplayName, getIdentifiedUserProfileImage } from './utils/utils'

interface Props {
	session: Session
	selected: boolean
	/** Whether MinimalSessionCard is rendered on an error page where we don't have the full session information. */
	errorVersion?: boolean
	showDetailedViewOverride?: boolean
	/** URL Params to attach to the session URL. */
	urlParams?: string
	linkDisabled?: boolean
	showDetailedSessionView?: boolean
	autoPlaySessions?: boolean
	configuration?: Pick<
		SessionFeedConfigurationContext,
		'countFormat' | 'datetimeFormat'
	>
	target?: string
	compact?: boolean
}

const MinimalSessionCard = React.memo(
	({
		session,
		selected,
		errorVersion = false,
		showDetailedViewOverride = false,
		urlParams,
		linkDisabled,
		autoPlaySessions = false,
		showDetailedSessionView:
			showDetailedSessionViewPlayerConfiguration = false,
		configuration,
		target,
		compact,
	}: Props) => {
		const ref = useRef<HTMLDivElement | null>(null)
		const { project_id, segment_id, session_secure_id } = useParams<{
			project_id: string
			segment_id: string
			session_secure_id: string
		}>()
		const projectIdRemapped =
			project_id === DEMO_PROJECT_ID
				? DEMO_WORKSPACE_PROXY_APPLICATION_ID
				: project_id
		const showDetailedSessionView =
			showDetailedSessionViewPlayerConfiguration ||
			showDetailedViewOverride
		const backfilled = sessionIsBackfilled(session as Session | undefined)

		const [viewed, setViewed] = useState(session.viewed || false)

		useEffect(() => {
			if (session_secure_id === session.secure_id) {
				setViewed(true)
			}
		}, [session.secure_id, session_secure_id])

		const [eventCounts, setEventCounts] = useState(undefined)

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
			if (
				autoPlaySessions &&
				session_secure_id === session.secure_id &&
				ref?.current
			) {
				ref.current.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				})
			}
		}, [autoPlaySessions, session.secure_id, session_secure_id])

		const customAvatarImage = getIdentifiedUserProfileImage(session)

		const innerContent = (
			<div
				className={clsx(styles.sessionCard, {
					[styles.selected]: selected,
					[styles.linkDisabled]: linkDisabled,
				})}
			>
				<div
					className={clsx(styles.sessionCardContentWrapper, {
						[styles.detailed]: showDetailedSessionView,
						[styles.errorVersion]: errorVersion,
						[styles.compact]: compact,
					})}
				>
					{!compact && (
						<div className={styles.avatarWrapper}>
							<Avatar
								seed={getDisplayName(session)}
								style={{ height: 25, width: 25 }}
								customImage={customAvatarImage}
							/>
						</div>
					)}
					<div className={styles.sessionTextSectionWrapper}>
						<div
							className={clsx(styles.sessionTextSection, {
								[styles.detailed]: showDetailedSessionView,
								[styles.errorVersion]: errorVersion,
							})}
						>
							<div
								className={clsx(
									styles.middleText,
									styles.identifier,
									'highlight-block',
								)}
							>
								{getDisplayName(session)}

								{backfilled && (
									<span className={styles.backfilledIcon}>
										<UserCross />
									</span>
								)}
							</div>
						</div>
						<div
							className={clsx(styles.sessionTextSection, {
								[styles.detailedSection]:
									showDetailedSessionView,
								[styles.withLongDatetimeFormat]:
									configuration?.datetimeFormat === 'ISO',
							})}
						>
							{showDetailedSessionView ? (
								<>
									{!errorVersion && (
										<div className={styles.topText}>
											{session.processed &&
											segment_id !== LIVE_SEGMENT_ID ? (
												<>
													{formatShortTime(
														(session.active_length ||
															0) / 1000,
														['h', 'm', 's'],
													)}
													<span
														className={
															styles.separator
														}
													>
														•
													</span>
													{(
														((session.active_length ||
															1) /
															(session.length ||
																1)) *
														100
													).toFixed(0)}
													% Active{' '}
												</>
											) : (
												'Live'
											)}
										</div>
									)}
									{errorVersion ? (
										<div className={styles.topText}>
											{session.os_name}
										</div>
									) : (
										<div className={styles.topText}>
											{`${
												session.city && session.state
													? `${session.city}, ${session.state}`
													: ''
											}`}
										</div>
									)}
									<div className={styles.topText}>
										<TextTransition
											text={
												configuration?.datetimeFormat
													? formatDatetime(
															session.created_at,
															configuration.datetimeFormat,
														)
													: `${new Date(
															session.created_at,
														).toLocaleString(
															'en-us',
															{
																day: 'numeric',
																month: 'long',
																year: 'numeric',
															},
														)}`
											}
											inline
										/>
									</div>
									<div className={styles.topText}>
										{`${session.browser_name}`}
									</div>
									{errorVersion && (
										<div className={styles.topText}>
											{`${session.environment}`}
										</div>
									)}
								</>
							) : (
								<div className={styles.topText}>
									{session.processed &&
									segment_id !== LIVE_SEGMENT_ID
										? MillisToMinutesAndSecondsVerbose(
												session.active_length || 0,
											)
										: !errorVersion
											? 'Live'
											: new Date(
													session.created_at,
												).toLocaleString('en-us', {
													day: 'numeric',
													month: 'long',
													year: 'numeric',
												})}
								</div>
							)}
						</div>
					</div>

					{!errorVersion && (
						<div
							className={clsx(styles.cardAnnotationContainer, {
								[styles.detailed]: showDetailedSessionView,
							})}
						>
							<Tooltip
								title={
									!viewed
										? "This session hasn't been viewed by anyone on your team."
										: 'This session has been viewed by someone on your team.'
								}
							>
								<div>
									<span
										className={styles.cardAnnotation}
										style={
											{
												'--primary-color': !viewed
													? 'var(--color-blue-400)'
													: 'var(--color-gray-300)',
											} as React.CSSProperties
										}
									>
										<SvgEyeOffIcon />
									</span>
								</div>
							</Tooltip>
							<Tooltip
								title={
									session.first_time
										? `This is ${session.identifier}'s first session on your app.`
										: `This is not ${session.identifier}'s first session. This icon will be colored for a user's first session on your app.`
								}
							>
								<div>
									<span
										className={styles.cardAnnotation}
										style={
											{
												'--primary-color':
													session.first_time
														? 'var(--color-red-400)'
														: 'var(--color-gray-300)',
											} as React.CSSProperties
										}
									>
										{
											ALERT_CONFIGURATIONS[
												'NEW_USER_ALERT'
											].icon
										}
									</span>
								</div>
							</Tooltip>
							<Tooltip
								title={
									session.has_errors
										? 'This session has errors.'
										: 'This session does not have any errors.'
								}
							>
								<div>
									<span
										className={styles.cardAnnotation}
										style={
											{
												'--primary-color':
													session.has_errors
														? '#eb5757'
														: 'var(--color-gray-300)',
											} as React.CSSProperties
										}
									>
										<SvgBugIcon />
									</span>
								</div>
							</Tooltip>
							<Tooltip
								title={
									session.has_rage_clicks
										? 'This session has rage clicks.'
										: 'This session does not have rage clicks.'
								}
							>
								<div>
									<span
										className={styles.cardAnnotation}
										style={
											{
												'--primary-color':
													session.has_rage_clicks
														? 'var(--color-red-400)'
														: 'var(--color-gray-300)',
											} as React.CSSProperties
										}
									>
										<SvgCursorClickIcon />
									</span>
								</div>
							</Tooltip>
						</div>
					)}
				</div>

				{!errorVersion && showDetailedSessionView && eventCounts && (
					<div className={styles.activityGraphContainer}>
						<ActivityGraph data={eventCounts} />
					</div>
				)}
			</div>
		)

		return (
			<div
				className={styles.sessionCardWrapper}
				key={session.secure_id}
				ref={ref}
			>
				{linkDisabled ? (
					innerContent
				) : (
					<Link
						target={target}
						to={`/${projectIdRemapped}/sessions/${
							session.secure_id
						}${urlParams || ''}`}
					>
						{innerContent}
					</Link>
				)}
			</div>
		)
	},
	(previousProps, nextProps) => {
		return (
			previousProps.configuration?.countFormat ===
				nextProps.configuration?.countFormat &&
			previousProps.configuration?.datetimeFormat ===
				nextProps.configuration?.datetimeFormat &&
			previousProps.selected === nextProps.selected &&
			previousProps.showDetailedSessionView ===
				nextProps.showDetailedSessionView
		)
	},
)

export default MinimalSessionCard
