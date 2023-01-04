import { useGetWebVitalsQuery } from '@graph/hooks'
import { Box, Form, IconSolidSearch, useFormState } from '@highlight-run/ui'
import { useEventTypeFilters } from '@pages/Player/components/EventStream/hooks/useEventTypeFilters'
import {
	getFilteredEvents,
	usefulEvent,
} from '@pages/Player/components/EventStream/utils'
import { StreamEventV2 } from '@pages/Player/components/EventStreamV2/StreamEventV2/StreamEventV2'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import {
	ReplayerState,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import { Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { useParams } from '@util/react-router/useParams'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import * as style from './EventStreamV2.css'

const EventStreamV2 = function () {
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
	const [isInteractingWithStreamEvents, setIsInteractingWithStreamEvents] =
		useState(false)
	const [events, setEvents] = useState<HighlightEvent[]>([])
	const form = useFormState({
		defaultValues: {
			search: '',
		},
	})
	const searchQuery = form.getValue('search')
	const eventTypeFilters = useEventTypeFilters()
	const virtuoso = useRef<VirtuosoHandle>(null)
	const { data } = useGetWebVitalsQuery({
		variables: {
			session_secure_id,
		},
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
		<Box className={style.container}>
			{isLoading ? (
				<div>
					<Skeleton
						count={20}
						height={43}
						width="301px"
						style={{
							marginTop: 16,
							marginLeft: 24,
							marginRight: 24,
							borderRadius: 8,
						}}
					/>
				</div>
			) : (
				<Box width="full" height="full">
					<Box px="12" py="8">
						<Form state={form}>
							<label>
								<Box
									display="flex"
									justifyContent="space-between"
									align="center"
								>
									<Box display="flex" align="center">
										<IconSolidSearch color="n8" size={16} />
									</Box>
									<Form.Input
										name={form.names.search}
										placeholder="Search"
										size="xSmall"
									/>
								</Box>
							</label>
						</Form>
					</Box>
					{replayer && filteredEvents.length > 0 ? (
						<Virtuoso
							onMouseEnter={() => {
								setIsInteractingWithStreamEvents(true)
							}}
							onMouseLeave={() => {
								setIsInteractingWithStreamEvents(false)
							}}
							ref={virtuoso}
							data={filteredEvents}
							totalCount={filteredEvents.length}
							itemContent={(index, event) => (
								<StreamEventV2
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
								/>
							)}
						/>
					) : (
						<Box p="12">
							<EmptyDevToolsCallout
								kind={Tab.Events}
								filter={searchQuery}
							/>
						</Box>
					)}
				</Box>
			)}
		</Box>
	)
}

export default EventStreamV2
