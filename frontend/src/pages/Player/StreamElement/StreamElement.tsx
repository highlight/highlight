/// <reference types="vite-plugin-svgr/client" />

import { ExternalLinkText } from '@components/ExternalLinkText'
import JsonViewer from '@components/JsonViewer/JsonViewer'
import { EventType } from '@highlight-run/rrweb'
import SvgActivityIcon from '@icons/ActivityIcon'
import SvgEyeIcon from '@icons/EyeIcon'
import SvgEyeOffIcon from '@icons/EyeOffIcon'
import SegmentIcon from '@icons/SegmentIcon'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { EventTypeDescriptions } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import WebVitalSimpleRenderer from '@pages/Player/StreamElement/Renderers/WebVitals/WebVitalRender'
import { getTimelineEventDisplayName } from '@pages/Player/utils/utils'
import { useParams } from '@util/react-router/useParams'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { message } from 'antd'
import clsx from 'clsx'
import moment from 'moment'
import React, { useState } from 'react'
import { FaBug, FaRegStopCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { BooleanParam, useQueryParam } from 'use-query-params'

import GoToButton from '../../../components/Button/GoToButton'
import InfoTooltip from '../../../components/InfoTooltip/InfoTooltip'
import SvgCursorClickIcon from '../../../static/CursorClickIcon'
import SvgCursorIcon from '../../../static/CursorIcon'
import SvgDimensionsIcon from '../../../static/DimensionsIcon'
import SvgFaceIdIcon from '../../../static/FaceIdIcon'
import { ReactComponent as HoverIcon } from '../../../static/hover.svg'
import SvgLinkIcon from '../../../static/LinkIcon'
import { ReactComponent as ReferrerIcon } from '../../../static/referrer.svg'
import { ReactComponent as ReloadIcon } from '../../../static/reload.svg'
import { ReactComponent as TabIcon } from '../../../static/tab.svg'
import SvgTargetIcon from '../../../static/TargetIcon'
import { MillisToMinutesAndSeconds } from '../../../util/time'
import { HighlightEvent } from '../HighlightEvent'
import { useReplayerContext } from '../ReplayerContext'
import RightPanelCard from '../RightPanelCard/RightPanelCard'
import { getAnnotationColor } from '../Toolbar/Toolbar'
import styles from './StreamElement.module.scss'
import StreamElementPayload from './StreamElementPayload'

const EVENT_TYPES_TO_NOT_RENDER_TIME = ['Web Vitals']

export const StreamElement = ({
	e,
	start,
	isCurrent,
	onGoToHandler,
	searchQuery,
	showDetails,
	isFirstCard,
}: {
	e: HighlightEvent
	start: number
	isCurrent: boolean
	onGoToHandler: (event: string) => void
	searchQuery: string
	showDetails: boolean
	isFirstCard: boolean
}) => {
	const [debug] = useQueryParam('debug', BooleanParam)
	const [selected, setSelected] = useState(false)
	const details = getEventRenderDetails(e)
	const { pause } = useReplayerContext()
	const timeSinceStart = Math.max(e?.timestamp - start, 0)
	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const { setActiveEvent } = usePlayerUIContext()
	const params = useParams<{ project_id: string }>()

	const showExpandedView = searchQuery.length > 0 || showDetails || selected
	const shouldShowTimestamp =
		e.type === EventType.Custom &&
		!EVENT_TYPES_TO_NOT_RENDER_TIME.includes(e.data.tag)

	return (
		<div
			className={clsx(styles.cardContainer, {
				[styles.firstCard]: isFirstCard,
			})}
			onMouseEnter={() => {
				setActiveEvent(e)
			}}
			onMouseLeave={() => {
				setActiveEvent(undefined)
			}}
		>
			<RightPanelCard
				key={e.identifier}
				className={clsx({ [styles.card]: !showDetails })}
				selected={isCurrent}
				onClick={() => {
					if (!showDetails) {
						setSelected(!selected)
					}
				}}
				primaryColor={getAnnotationColor(details.title as any)}
			>
				<div
					className={clsx(styles.streamElement, {
						[styles.noTimestamp]: !shouldShowTimestamp,
					})}
					key={e.identifier}
					id={e.identifier}
				>
					<div className={styles.headerRow}>
						<div className={styles.iconWrapper}>
							{getPlayerEventIcon(
								details.title || '',
								details.payload,
							)}
						</div>
					</div>
					<div
						className={
							showExpandedView && shouldShowTimestamp
								? styles.eventContentVerbose
								: styles.eventContent
						}
					>
						<p
							className={clsx(styles.eventText, {
								[styles.eventTextSelected]: showExpandedView,
							})}
						>
							{/* Removes the starting and ending quotes */}
							{!details.isReactNode
								? JSON.stringify(
										details.displayValue,
								  )?.replaceAll(/^\"|\"$/g, '')
								: details.displayValue}
						</p>
					</div>
					{shouldShowTimestamp && (
						<div className={clsx(styles.eventTime)}>
							{showPlayerAbsoluteTime
								? playerTimeToSessionAbsoluteTime({
										sessionStartTime: start,
										relativeTime: timeSinceStart,
								  })
								: MillisToMinutesAndSeconds(timeSinceStart)}
						</div>
					)}
					{showExpandedView && (
						<>
							{debug ? (
								<div
									onClick={(event) => {
										event.stopPropagation()
									}}
								>
									<JsonViewer
										name={null}
										collapsed
										src={e.data as object}
									/>
								</div>
							) : (
								<div className={styles.payloadContainer}>
									<h2 className="mb-3 text-xs font-medium">
										{getTimelineEventDisplayName(
											details.title || '',
										)}{' '}
										<InfoTooltip
											title={
												//@ts-expect-error
												EventTypeDescriptions[
													details.title || ''
												]
											}
										/>
									</h2>

									{e.type === EventType.Custom &&
									e.data.tag === 'Web Vitals' ? (
										<WebVitalSimpleRenderer
											showDetailedView
											// @ts-expect-error
											vitals={e.data.payload.vitals}
										/>
									) : (
										<StreamElementPayload
											payload={
												typeof details.payload ===
												'object'
													? JSON.stringify(
															details.payload,
													  )
													: typeof details.payload ===
															'boolean' &&
													  details.title?.includes(
															'Tab',
													  )
													? details.payload
														? 'The user switched away from this tab.'
														: 'The user is currently active on this tab.'
													: details.payload
											}
											searchQuery={searchQuery}
										/>
									)}

									{e.type === EventType.Custom &&
										e.data.tag === 'Web Vitals' && (
											<Link
												to={`/${params.project_id}/dashboards/web-vitals`}
												className="mt-4 inline-block"
											>
												<ExternalLinkText>
													View web vitals dashboard
												</ExternalLinkText>
											</Link>
										)}
								</div>
							)}
							{shouldShowTimestamp && (
								<>
									<div className={styles.timestamp}>
										{moment(e.timestamp).format(
											'h:mm:ss A',
										)}
									</div>
									<GoToButton
										className={styles.goToButton}
										onClick={(e) => {
											// Stopping the event from propagating up to the parent button. This is to allow the element to stay opened when the user clicks on the GoToButton. Without this the element would close.
											e.stopPropagation()
											// Sets the current event as null. It will be reset as the player continues.
											onGoToHandler('')
											pause(timeSinceStart)

											message.success(
												`Changed player time showing you ${
													details.title
												} at ${MillisToMinutesAndSeconds(
													timeSinceStart,
												)}`,
											)
										}}
									/>
								</>
							)}
						</>
					)}
				</div>
			</RightPanelCard>
		</div>
	)
}

export type EventRenderDetails = {
	title?: string
	payload?: string
	displayValue: string | React.ReactNode
	isReactNode?: boolean
}

export const getEventRenderDetails = (
	e: HighlightEvent,
): EventRenderDetails => {
	const details: EventRenderDetails = {
		displayValue: '',
	}
	if (e.type === EventType.Custom) {
		const payload = e.data.payload as any

		details.title = e.data.tag
		switch (e.data.tag) {
			case 'Identify':
				details.displayValue = JSON.parse(payload).user_identifier
				break
			case 'Track':
				try {
					const json = JSON.parse(payload)
					details.displayValue = json.event
				} catch {
					details.displayValue = e.identifier
				}
				break
			case 'Viewport':
				details.displayValue = `${payload.height} x ${payload.width}`
				break
			case 'Navigate':
			case 'Click':
			case 'Focus':
			case 'Segment':
				try {
					const keys = Object.keys(JSON.parse(payload))
					details.displayValue = `{${keys.join(', ')}}`
				} catch {
					details.displayValue = payload
				}
				break
			case 'Web Vitals':
				details.displayValue = (
					<WebVitalSimpleRenderer vitals={payload.vitals} />
				)
				details.isReactNode = true
				break
			case 'Page Unload':
				details.displayValue = 'Page Unload'
				break
			case 'TabHidden':
				details.displayValue = payload ? 'Tab Hidden' : 'Tab Visible'
				break
			default:
				details.displayValue = payload
				break
		}
		details.payload = e.data.payload as string
	}

	return details
}

export const getPlayerEventIcon = (
	title: string,
	payload?: any,
	debug?: boolean,
) =>
	title === 'Click' ? (
		<SvgCursorClickIcon className={clsx(styles.tiltedIcon)} />
	) : title?.includes('Segment') ? (
		<SegmentIcon className={clsx(styles.defaultIcon)} />
	) : title === 'Navigate' ? (
		<SvgLinkIcon className={clsx(styles.defaultIcon)} />
	) : title === 'Track' ? (
		<SvgTargetIcon className={clsx(styles.defaultIcon)} />
	) : title === 'Identify' ? (
		<SvgFaceIdIcon className={clsx(styles.defaultIcon)} />
	) : title === 'Reload' ? (
		<ReloadIcon className={clsx(styles.defaultIcon)} />
	) : title === 'Referrer' ? (
		<ReferrerIcon className={clsx(styles.defaultIcon)} />
	) : title === 'Tab' ? (
		<TabIcon className={clsx(styles.defaultIcon)} />
	) : title === 'Stop' ? (
		<FaRegStopCircle className={clsx(styles.defaultIcon)} />
	) : title === 'Viewport' ? (
		<SvgDimensionsIcon className={clsx(styles.defaultIcon)} />
	) : title === 'TabHidden' ? (
		payload ? (
			<SvgEyeOffIcon className={clsx(styles.defaultIcon)} />
		) : (
			<SvgEyeIcon className={clsx(styles.defaultIcon)} />
		)
	) : title === 'Focus' ? (
		<SvgCursorIcon className={clsx(styles.defaultIcon)} />
	) : title === 'Web Vitals' ? (
		<SvgActivityIcon className={clsx(styles.defaultIcon)} />
	) : debug ? (
		<FaBug className={clsx(styles.defaultIcon)} />
	) : (
		<HoverIcon className={clsx(styles.tiltedIcon)} />
	)
