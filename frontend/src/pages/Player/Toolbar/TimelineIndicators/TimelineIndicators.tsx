import { useAuthContext } from '@authentication/AuthContext'
import { Replayer } from '@highlight-run/rrweb'
import { playerMetaData } from '@highlight-run/rrweb/typings/types'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { useResourceOrErrorDetailPanel } from '@pages/Player/Toolbar/DevToolsWindow/ResourceOrErrorDetailPanel/ResourceOrErrorDetailPanel'
import RageClickSpan from '@pages/Player/Toolbar/RageClickSpan/RageClickSpan'
import classNames from 'classnames'
import { AnimatePresence } from 'framer-motion'
import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

import usePlayerConfiguration from '../../PlayerHook/utils/usePlayerConfiguration'
import {
	ParsedErrorObject,
	ParsedSessionInterval,
	RageClick,
	ReplayerState,
	useReplayerContext,
} from '../../ReplayerContext'
import {
	DevToolTabType,
	useDevToolsContext,
} from '../DevToolsContext/DevToolsContext'
import TimelineCommentAnnotation from '../TimelineAnnotation/TimelineCommentAnnotation'
import TimelineErrorAnnotation from '../TimelineAnnotation/TimelineErrorAnnotation'
import TimelineEventAnnotation from '../TimelineAnnotation/TimelineEventAnnotation'
import styles from './TimelineIndicators.module.scss'

interface Props {
	openDevTools: boolean
	refContainer: React.RefObject<HTMLDivElement>
	sessionIntervals: ParsedSessionInterval[]
	selectedTimelineAnnotationTypes: string[]
	rageClicks: RageClick[]
	startTime: number
	pause: (time?: number | undefined) => void
	activeEvent: HighlightEvent | undefined
	errorId: string | null
	setShowDevTools: (val: boolean) => void
	setSelectedDevToolsTab: (val: DevToolTabType) => void
	setErrorPanel: (val: ParsedErrorObject) => void
	replayer: Replayer
	sessionMetadata: playerMetaData
	width: number
}

const TimelineIndicatorsMemoized = React.memo(
	({
		refContainer,
		sessionIntervals,
		selectedTimelineAnnotationTypes,
		rageClicks,
		startTime,
		pause,
		activeEvent,
		errorId,
		setShowDevTools,
		setSelectedDevToolsTab,
		setErrorPanel,
		replayer,
		sessionMetadata,
		width,
	}: Props) => {
		const getRelativeStart = (
			sessionInterval: ParsedSessionInterval,
			ts: number,
		) => {
			const intervalWidth = sessionInterval.active
				? sessionInterval.endPercent - sessionInterval.startPercent
				: 0.01
			// calculate the event position percentage, relative to the entire timeline.
			// i.e. each event start is weighted relative to the size of the interval it is in,
			// since inactive intervals have a fixed small size.
			return (
				sessionInterval.startPercent +
				intervalWidth *
					((ts - startTime - sessionInterval.startTime) /
						sessionInterval.duration)
			)
		}
		return (
			<AnimatePresence presenceAffectsLayout>
				<aside
					className={classNames(styles.container)}
					ref={refContainer}
					style={{ width }}
				>
					{sessionIntervals.map((sessionInterval, index) => (
						<div
							key={`${sessionInterval.startPercent}-${index}`}
							className={classNames(styles.sessionInterval, {
								[styles.active]: sessionInterval.active,
							})}
							style={{
								left: `${sessionInterval.startPercent * 100}%`,
								width: `${
									(sessionInterval.endPercent -
										sessionInterval.startPercent) *
									100
								}%`,
							}}
						>
							{sessionInterval.sessionEvents.map((event) => {
								return (
									<TimelineEventAnnotation
										event={event}
										startTime={startTime}
										relativeStartPercent={getRelativeStart(
											sessionInterval,
											event.timestamp,
										)}
										selectedTimelineAnnotationTypes={
											selectedTimelineAnnotationTypes
										}
										pause={pause}
										key={`${event.timestamp}-${event.identifier}`}
										activeEvent={activeEvent}
									/>
								)
							})}
							{selectedTimelineAnnotationTypes.includes(
								'Errors',
							) &&
								sessionInterval.errors.map((error) => (
									<TimelineErrorAnnotation
										error={error}
										key={`${error.timestamp}-${error.id}}`}
										relativeStartPercent={getRelativeStart(
											sessionInterval,
											new Date(
												error.timestamp!,
											).getTime(),
										)}
										errorId={errorId}
										setShowDevTools={setShowDevTools}
										setSelectedDevToolsTab={
											setSelectedDevToolsTab
										}
										setErrorPanel={setErrorPanel}
										replayer={replayer}
										sessionMetadata={sessionMetadata}
										pause={pause}
									/>
								))}
							{selectedTimelineAnnotationTypes.includes(
								'Comments',
							) &&
								sessionInterval.comments.map((comment) => {
									return (
										<TimelineCommentAnnotation
											comment={comment}
											key={comment.id}
											relativeStartPercent={getRelativeStart(
												sessionInterval,
												startTime +
													(comment.timestamp || 0),
											)}
										/>
									)
								})}
							{selectedTimelineAnnotationTypes.includes(
								'Click',
							) &&
								rageClicks
									.filter(
										(rageClick) =>
											rageClick.sessionIntervalIndex ===
											index,
									)
									.map((rageClick) => (
										<RageClickSpan
											rageClick={rageClick}
											key={rageClick.startTimestamp}
										/>
									))}
						</div>
					))}
				</aside>
			</AnimatePresence>
		)
	},
)

const TimelineIndicators = React.memo(({ width }: { width: number }) => {
	const location = useLocation()
	const errorId = new URLSearchParams(location.search).get(
		PlayerSearchParameters.errorId,
	)

	const {
		state,
		replayer,
		rageClicks,
		sessionIntervals,
		pause,
		sessionMetadata,
	} = useReplayerContext()
	const {
		selectedTimelineAnnotationTypes,
		setSelectedTimelineAnnotationTypes,
		setShowDevTools,
		setSelectedDevToolsTab,
	} = usePlayerConfiguration()
	const { setErrorPanel } = useResourceOrErrorDetailPanel()
	const { openDevTools } = useDevToolsContext()
	const refContainer = useRef<HTMLDivElement>(null)

	const { isHighlightAdmin } = useAuthContext()
	const { activeEvent } = usePlayerUIContext()

	useEffect(() => {
		if (
			isHighlightAdmin &&
			rageClicks.length > 0 &&
			!selectedTimelineAnnotationTypes.includes('Click') &&
			(state === ReplayerState.LoadedWithDeepLink ||
				state === ReplayerState.Empty ||
				state === ReplayerState.LoadedAndUntouched)
		) {
			setSelectedTimelineAnnotationTypes([
				...selectedTimelineAnnotationTypes,
				'Click',
			])
		}
	}, [
		isHighlightAdmin,
		rageClicks.length,
		selectedTimelineAnnotationTypes,
		setSelectedTimelineAnnotationTypes,
		state,
	])

	if (state === ReplayerState.Loading || !replayer) {
		return null
	}

	return (
		<TimelineIndicatorsMemoized
			openDevTools={openDevTools}
			refContainer={refContainer}
			sessionIntervals={sessionIntervals}
			selectedTimelineAnnotationTypes={selectedTimelineAnnotationTypes}
			rageClicks={rageClicks}
			startTime={sessionMetadata.startTime || 0}
			pause={pause}
			activeEvent={activeEvent}
			errorId={errorId}
			setShowDevTools={setShowDevTools}
			setSelectedDevToolsTab={setSelectedDevToolsTab}
			setErrorPanel={setErrorPanel}
			replayer={replayer}
			sessionMetadata={sessionMetadata}
			width={width}
		/>
	)
})

export default TimelineIndicators
