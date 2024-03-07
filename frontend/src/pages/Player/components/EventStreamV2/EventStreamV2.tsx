import LoadingBox from '@components/LoadingBox'
import { useGetWebVitalsQuery } from '@graph/hooks'
import { Box, Form, IconSolidSearch } from '@highlight-run/ui/components'
import { StreamEventV2 } from '@pages/Player/components/EventStreamV2/StreamEventV2/StreamEventV2'
import {
	getFilteredEvents,
	usefulEvent,
} from '@pages/Player/components/EventStreamV2/utils'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import {
	ReplayerState,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import { Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { useParams } from '@util/react-router/useParams'
import _ from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import { styledVerticalScrollbar } from '@/style/common.css'

import * as style from './EventStreamV2.css'

const EventStreamV2 = function () {
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const {
		sessionMetadata,
		eventsForTimelineIndicator: replayerEvents,
		state,
		replayer,
		currentEvent,
		setCurrentEvent,
	} = useReplayerContext()
	const {
		setActiveEvent,
		setRightPanelView,
		activeEventIndex,
		setActiveEventIndex,
		searchItem,
		setSearchItem,
	} = usePlayerUIContext()
	const [isInteractingWithStreamEvents, setIsInteractingWithStreamEvents] =
		useState(false)
	const [events, setEvents] = useState<HighlightEvent[]>([])
	const formStore = Form.useStore({
		defaultValues: {
			search: searchItem,
		},
	})
	const searchQuery = formStore.useValue('search')
	const { selectedTimelineAnnotationTypes } = usePlayerConfiguration()
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
		() =>
			getFilteredEvents(
				searchQuery!,
				usefulEvents,
				new Set(selectedTimelineAnnotationTypes),
			),
		[selectedTimelineAnnotationTypes, searchQuery, usefulEvents],
	)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const scrollFunction = useCallback(
		_.debounce((eventIndex: number) => {
			if (virtuoso.current && eventIndex > -1) {
				virtuoso.current.scrollToIndex({
					index: eventIndex,
					align: 'center',
					behavior: 'smooth',
				})
			}
		}, 1000 / 60),
		[],
	)

	useEffect(() => {
		if (!isInteractingWithStreamEvents) {
			const currentEventIndex = usefulEvents.findIndex(
				(event) => event.identifier === currentEvent,
			)
			scrollFunction(currentEventIndex)
		}
	}, [
		currentEvent,
		isInteractingWithStreamEvents,
		scrollFunction,
		usefulEvents,
	])

	const isLoading =
		!replayer || state === ReplayerState.Loading || events.length === 0

	return (
		<Box cssClass={style.container}>
			{isLoading ? (
				<LoadingBox />
			) : (
				<Box
					width="full"
					height="full"
					display="flex"
					flexDirection="column"
				>
					<Box px="12" py="8">
						<Form store={formStore}>
							<Box
								display="flex"
								justifyContent="space-between"
								align="center"
								as="label"
								gap="6"
								color="secondaryContentText"
							>
								<IconSolidSearch size={16} />
								<Form.Input
									name={formStore.names.search}
									placeholder="Search"
									size="xSmall"
									outline={false}
								/>
							</Box>
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
							className={styledVerticalScrollbar}
							initialTopMostItemIndex={activeEventIndex}
							itemContent={(index, event) => (
								<StreamEventV2
									e={event}
									key={index}
									start={sessionMetadata.startTime}
									isFirstCard={index === 0}
									isCurrent={
										event.identifier === currentEvent
									}
									onGoToHandler={(e) => {
										setCurrentEvent(e)
										setActiveEvent(event)
										setRightPanelView(RightPanelView.Event)
										setActiveEventIndex(index)
										setSearchItem(searchQuery)
									}}
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
