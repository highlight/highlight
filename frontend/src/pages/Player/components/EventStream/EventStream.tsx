import Input from '@components/Input/Input'
import LoadingBox from '@components/LoadingBox'
import Switch from '@components/Switch/Switch'
import { useGetWebVitalsQuery } from '@graph/hooks'
import { EventType } from '@highlight-run/rrweb'
import { eventWithTime } from '@highlight-run/rrweb-types'
import SvgSearchIcon from '@icons/SearchIcon'
import { EventStreamTypesFilter } from '@pages/Player/components/EventStream/components/EventStreamTypesFilter'
import { useEventTypeFilters } from '@pages/Player/components/EventStream/hooks/useEventTypeFilters'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import {
	ReplayerState,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import { StreamElement } from '@pages/Player/StreamElement/StreamElement'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import TextTransition from 'react-text-transition'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import styles from './EventStream.module.scss'

const EventStream = () => {
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const {
		sessionMetadata,
		time,
		eventsForTimelineIndicator: replayerEvents,
		state,
		replayer,
		currentEvent,
		setCurrentEvent,
	} = useReplayerContext()
	const [searchQuery, setSearchQuery] = useState('')
	const [showDetails, setShowDetails] = useState(false)
	const [listIsInTopPosition, setListIsInTopPosition] = useState(true)
	const eventTypeFilters = useEventTypeFilters()
	const [isInteractingWithStreamEvents, setIsInteractingWithStreamEvents] =
		useState(false)
	const [events, setEvents] = useState<HighlightEvent[]>([])
	const virtuoso = useRef<VirtuosoHandle>(null)
	const { data } = useGetWebVitalsQuery({
		variables: {
			session_secure_id: session_secure_id!,
		},
		skip: !session_secure_id,
	})

	useEffect(() => {
		if (data?.web_vitals && data.web_vitals?.length > 0) {
			const webVitalEvent = {
				data: {
					payload: {
						vitals: data.web_vitals.map(({ name, value }) => ({
							name,
							value,
						})),
					},
					tag: 'Web Vitals',
				},
				timestamp: 0,
				type: 5,
				identifier: '-1',
			}
			setEvents([webVitalEvent, ...replayerEvents])
		} else {
			setEvents([...replayerEvents])
		}
	}, [data?.web_vitals, replayerEvents])

	const usefulEvents = useMemo(() => events.filter(usefulEvent), [events])

	const filteredEvents = useMemo(
		() => getFilteredEvents(searchQuery, usefulEvents, eventTypeFilters),
		[eventTypeFilters, searchQuery, usefulEvents],
	)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const scrollFunction = useCallback(
		_.debounce(
			(
				currentEventId: string,
				usefulEventsList: HighlightEvent[],
				state,
			) => {
				if (virtuoso.current) {
					const matchingEventIndex = usefulEventsList.findIndex(
						(event) => event.identifier === currentEventId,
					)

					if (matchingEventIndex > -1) {
						virtuoso.current.scrollToIndex({
							index: matchingEventIndex,
							align: 'center',
							behavior: 'smooth',
						})
					}
					if (state !== ReplayerState.Playing) {
					}
				}
			},
			1000 / 60,
		),
		[],
	)

	useEffect(() => {
		if (!isInteractingWithStreamEvents) {
			scrollFunction(currentEvent, filteredEvents, state)
		}
	}, [
		currentEvent,
		scrollFunction,
		filteredEvents,
		isInteractingWithStreamEvents,
		state,
	])

	const isLoading = events.length === 0

	return (
		<>
			<div id="wrapper" className={styles.eventStreamContainer}>
				<div className={styles.container}>
					<div
						className={clsx(styles.header, {
							[styles.withBottomBorder]: !listIsInTopPosition,
						})}
					>
						<div className={styles.searchContainer}>
							<Input
								placeholder="Search events"
								className={styles.search}
								suffix={
									<SvgSearchIcon
										className={styles.searchIcon}
									/>
								}
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value)
								}}
								allowClear
							/>

							<EventStreamTypesFilter />
						</div>
						<div className={styles.secondRow}>
							<span>
								<>
									<TextTransition
										inline
										text={
											isLoading
												? '-'
												: filteredEvents.length.toLocaleString()
										}
									/>{' '}
									events
								</>
							</span>
							<Switch
								label="Show Details"
								trackingId="EventStreamShowDetails"
								className={styles.detailsSwitch}
								checked={showDetails}
								onChange={(e) => {
									setShowDetails(e)
								}}
							/>
						</div>
					</div>
					{isLoading ? (
						<LoadingBox />
					) : replayer && filteredEvents.length > 0 ? (
						<Virtuoso
							onMouseEnter={() => {
								setIsInteractingWithStreamEvents(true)
							}}
							onMouseLeave={() => {
								setIsInteractingWithStreamEvents(false)
							}}
							//     @ts-ignore
							components={{ List: VirtuosoList }}
							ref={virtuoso}
							atTopStateChange={(atTop) => {
								setListIsInTopPosition(atTop)
							}}
							data={filteredEvents}
							totalCount={filteredEvents.length}
							itemContent={(index, event) => (
								<StreamElement
									e={event}
									key={index}
									start={sessionMetadata.startTime}
									isFirstCard={index === 0}
									isCurrent={
										event.timestamp -
											sessionMetadata.startTime ===
											time ||
										event.identifier === currentEvent
									}
									onGoToHandler={setCurrentEvent}
									searchQuery={searchQuery}
									showDetails={
										showDetails ||
										(state !== ReplayerState.Playing &&
											currentEvent === event.identifier)
									}
								/>
							)}
						/>
					) : (
						<div className={styles.emptyMessageContainer}>
							{searchQuery === ''
								? 'There are no events matching your filters.'
								: `There are no events that match "${searchQuery}".`}
						</div>
					)}
				</div>
				)
			</div>
		</>
	)
}

export default EventStream

// used in filter() type methods to fetch events we want
export const usefulEvent = (e: eventWithTime): boolean => {
	if (e.type === EventType.Custom) {
		if (e.data.tag === 'Segment Identify') {
			e.data.tag = 'Segment'
		}
		return !!e.data.tag
	}

	return false
}

const VirtuosoList = React.forwardRef((props, ref) => {
	// @ts-ignore
	return <div {...props} ref={ref} className={styles.virtualList} />
})

const getFilteredEvents = (
	searchQuery: string,
	events: HighlightEvent[],
	eventTypeFilters: any,
) => {
	const normalizedSearchQuery = searchQuery.toLocaleLowerCase()
	const searchTokens = normalizedSearchQuery.split(' ')

	return events.filter((event) => {
		if (event.type === EventType.Custom) {
			switch (event.data.tag) {
				case 'Identify':
					if (!eventTypeFilters.showIdentify) {
						return false
					}
					try {
						const userObject = JSON.parse(
							event.data.payload as string,
						)
						const keys = Object.keys(userObject)

						/**
						 * For user properties, we allow for searching by the key.
						 */
						const matchedKey = searchTokens.some((searchToken) => {
							return keys.some((key) =>
								key.toLocaleLowerCase().includes(searchToken),
							)
						})

						return (
							matchedKey ||
							keys.some((key) => {
								if (typeof userObject[key] === 'string') {
									return searchTokens.some((searchToken) => {
										return userObject[key]
											.toLowerCase()
											.includes(searchToken)
									})
								}
								return false
							})
						)
					} catch (e) {
						return false
					}
				case 'Track':
					if (!eventTypeFilters.showTrack) {
						return false
					}
					try {
						const trackProperties = JSON.parse(
							event.data.payload as string,
						)
						const keys = Object.keys(trackProperties)

						/**
						 * For track properties, we allow for searching by the key.
						 */
						const matchedKey = searchTokens.some((searchToken) => {
							return keys.some((key) =>
								key.toLocaleLowerCase().includes(searchToken),
							)
						})

						return (
							matchedKey ||
							keys.some((key) => {
								if (typeof trackProperties[key] === 'string') {
									return searchTokens.some((searchToken) => {
										return trackProperties[key]
											.toLowerCase()
											.includes(searchToken)
									})
								}
								return false
							})
						)
					} catch (e) {
						return false
					}
				case 'Viewport':
					if (!eventTypeFilters.showViewport) {
						return false
					}
					return 'viewport'.includes(normalizedSearchQuery)
				case 'WebVital':
					if (!eventTypeFilters.showWebVitals) {
						return false
					}
					return 'web vitals'.includes(normalizedSearchQuery)
				case 'Segment':
					if (!eventTypeFilters.showSegment) {
						return false
					}
					try {
						const userObject = JSON.parse(
							event.data.payload as string,
						)
						const keys = Object.keys(userObject)

						return keys.some((key) => {
							if (typeof userObject[key] === 'string') {
								return searchTokens.some((searchToken) => {
									return userObject[key]
										.toLowerCase()
										.includes(searchToken)
								})
							}
							return false
						})
					} catch (e) {
						return false
					}
				case 'Focus':
					if (!eventTypeFilters.showFocus) {
						return false
					}
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Navigate':
					if (!eventTypeFilters.showNavigate) {
						return false
					}
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Referrer':
					if (!eventTypeFilters.showReferrer) {
						return false
					}
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Click':
					if (!eventTypeFilters.showClick) {
						return false
					}
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Reload':
					if (!eventTypeFilters.showReload) {
						return false
					}
					return searchTokens.some((searchToken) => {
						return (event.data.payload as string)
							.toLowerCase()
							.includes(searchToken)
					})
				case 'Web Vitals':
					return eventTypeFilters.showWebVitals
				case 'Performance':
					return false
				default:
					return event.data.tag
						.toLocaleLowerCase()
						.includes(normalizedSearchQuery)
			}
		}
	})
}
