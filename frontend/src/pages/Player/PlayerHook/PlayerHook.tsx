import { useAuthContext } from '@authentication/AuthContext'
import { datadogLogs } from '@datadog/browser-logs'
import {
	OnSessionPayloadAppendedDocument,
	useGetEventChunksQuery,
	useGetEventChunkUrlQuery,
	useGetSessionIntervalsQuery,
	useGetSessionPayloadLazyQuery,
	useGetSessionQuery,
	useGetTimelineIndicatorEventsQuery,
	useMarkSessionAsViewedMutation,
} from '@graph/hooks'
import { GetSessionQuery } from '@graph/operations'
import {
	customEvent,
	viewportResizeDimension,
} from '@highlight-run/rrweb/typings/types'
import { usefulEvent } from '@pages/Player/components/EventStream/EventStream'
import {
	CHUNKING_DISABLED_PROJECTS,
	FRAME_MS,
	getTimeFromReplayer,
	LOOKAHEAD_MS,
	MAX_CHUNK_COUNT,
	PlayerActionType,
	PlayerInitialState,
	PlayerReducer,
	SessionViewability,
} from '@pages/Player/PlayerHook/PlayerState'
import log from '@util/log'
import { useParams } from '@util/react-router/useParams'
import { timerEnd } from '@util/timer/timer'
import useMapRef from '@util/useMapRef'
import { H } from 'highlight.run'
import _ from 'lodash'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { BooleanParam, useQueryParam } from 'use-query-params'

import { HighlightEvent } from '../HighlightEvent'
import { ReplayerContextInterface, ReplayerState } from '../ReplayerContext'
import {
	findNextSessionInList,
	PlayerSearchParameters,
	toHighlightEvents,
	useSetPlayerTimestampFromSearchParam,
} from './utils'
import usePlayerConfiguration from './utils/usePlayerConfiguration'

export const usePlayer = (): ReplayerContextInterface => {
	const { isLoggedIn, isHighlightAdmin } = useAuthContext()
	const { session_secure_id, project_id } = useParams<{
		session_secure_id: string
		project_id: string
	}>()
	const history = useHistory()
	const [download] = useQueryParam('download', BooleanParam)

	const {
		setPlayerTime: setPlayerTimeToPersistance,
		autoPlaySessions,
		autoPlayVideo,
		showPlayerMouseTail,
		setShowLeftPanel,
		setShowRightPanel,
		skipInactive,
	} = usePlayerConfiguration()

	const [markSessionAsViewed] = useMarkSessionAsViewedMutation()
	const [
		getSessionPayloadQuery,
		{ data: sessionPayload, subscribeToMore: subscribeToSessionPayload },
	] = useGetSessionPayloadLazyQuery({
		fetchPolicy: 'no-cache',
	})
	const { refetch: fetchEventChunkURL } = useGetEventChunkUrlQuery({
		fetchPolicy: 'no-cache',
		skip: true,
	})
	const { data: sessionIntervals } = useGetSessionIntervalsQuery({
		variables: {
			session_secure_id: session_secure_id,
		},
		skip: !session_secure_id,
	})
	const { data: eventChunksData } = useGetEventChunksQuery({
		variables: { secure_id: session_secure_id },
		skip:
			!session_secure_id ||
			CHUNKING_DISABLED_PROJECTS.includes(project_id),
	})
	const { data: timelineIndicatorEvents } =
		useGetTimelineIndicatorEventsQuery({
			variables: {
				session_secure_id: session_secure_id,
			},
			skip: !session_secure_id,
		})
	const { data: sessionData } = useGetSessionQuery({
		variables: {
			secure_id: session_secure_id,
		},
		onCompleted: useCallback(
			(data: GetSessionQuery) => {
				dispatch({
					type: PlayerActionType.loadSession,
					data,
					fetchEventChunkURL,
				})
			},
			[fetchEventChunkURL],
		),
		onError: useCallback(() => {
			dispatch({
				type: PlayerActionType.loadSession,
				data: { session: undefined },
				fetchEventChunkURL,
			})
		}, [fetchEventChunkURL]),
		skip: !session_secure_id,
		fetchPolicy: 'network-only',
	})

	const loadingChunks = useRef<Set<number>>(new Set<number>())
	const unsubscribeSessionPayloadFn = useRef<(() => void) | null>()
	const animationFrameID = useRef<number>(0)
	const currentChunkIdx = useRef<number>(0)
	// used to track latest time atomically where the state may be out of date
	const lastTimeRef = useRef<number>(0)

	const [
		chunkEventsRef,
		chunkEventsSet,
		chunkEventsRemove,
		chunkEventsReset,
	] = useMapRef<number, HighlightEvent[]>()
	const [state, dispatch] = useReducer(PlayerReducer, {
		...PlayerInitialState,
		chunkEventsRef,
		isLoggedIn,
		isHighlightAdmin,
		markSessionAsViewed,
		getSessionPayloadQuery,
		fetchEventChunkURL,
	})

	const { setPlayerTimestamp } = useSetPlayerTimestampFromSearchParam(
		(t) => seek(t),
		state.replayer,
	)

	const resetPlayer = useCallback(
		(nextState?: ReplayerState) => {
			if (unsubscribeSessionPayloadFn.current) {
				unsubscribeSessionPayloadFn.current()
				unsubscribeSessionPayloadFn.current = undefined
			}
			if (animationFrameID.current) {
				cancelAnimationFrame(animationFrameID.current)
				animationFrameID.current = 0
			}
			loadingChunks.current.clear()
			currentChunkIdx.current = 0
			chunkEventsReset()
			dispatch({
				type: PlayerActionType.reset,
				projectId: project_id,
				sessionSecureId: session_secure_id,
				nextState,
			})
		},
		[chunkEventsReset, project_id, session_secure_id],
	)

	// Returns the player-relative timestamp of the end of the current inactive interval.
	// Returns undefined if not in an interval or the interval is marked as active.
	const getInactivityEnd = useCallback(
		(time: number): number | undefined => {
			for (const interval of state.sessionIntervals) {
				if (time >= interval.startTime && time < interval.endTime) {
					if (!interval.active) {
						return interval.endTime
					} else {
						return undefined
					}
				}
			}
			return undefined
		},
		[state.sessionIntervals],
	)

	const getChunkIdx = useCallback(
		(ts: number) => {
			let idx = 0
			eventChunksData?.event_chunks?.forEach((chunk, i) => {
				if (chunk.timestamp <= ts) {
					idx = i
				}
			})
			return idx
		},
		[eventChunksData],
	)

	const getChunkTs = useCallback(
		(idx: number) => {
			return eventChunksData?.event_chunks[idx].timestamp
		},
		[eventChunksData],
	)

	// returns loaded chunks that are no longer needed.
	const getChunksToRemove = useCallback(
		(
			chunkEvents: Omit<
				Map<number, HighlightEvent[]>,
				'set' | 'clear' | 'delete'
			>,
			startIdx: number,
		): Set<number> => {
			const toRemove = new Set<number>()
			const chunksIndexesWithData = Array.from(chunkEvents.entries())
				.filter(([, v]) => !!v.length)
				.map(([k]) => k)
			if (chunksIndexesWithData.length <= MAX_CHUNK_COUNT) {
				return toRemove
			}
			chunksIndexesWithData.sort((a, b) => a - b)

			const startTs = getChunkTs(startIdx)
			for (const idx of chunksIndexesWithData) {
				const chunkTs = getChunkTs(idx)
				if (
					idx < startIdx ||
					(chunkTs &&
						startTs &&
						idx >= startIdx + MAX_CHUNK_COUNT &&
						chunkTs > startTs + LOOKAHEAD_MS)
				) {
					toRemove.add(idx)
				}
			}
			return toRemove
		},
		[getChunkTs],
	)

	const dispatchAction = useCallback(
		(time: number, action?: ReplayerState) => {
			currentChunkIdx.current = getChunkIdx(
				state.sessionMetadata.startTime + time,
			)
			dispatch({
				type: PlayerActionType.onChunksLoad,
				showPlayerMouseTail,
				time,
				action,
			})
		},
		[getChunkIdx, showPlayerMouseTail, state.sessionMetadata.startTime],
	)

	// Ensure all chunks between startTs and endTs are loaded.
	const ensureChunksLoaded = useCallback(
		async (startTime: number, endTime?: number, action?: ReplayerState) => {
			if (
				CHUNKING_DISABLED_PROJECTS.includes(project_id) ||
				!state.session?.chunked
			) {
				if (action) dispatchAction(startTime, action)
				return
			}

			const startIdx = getChunkIdx(
				state.sessionMetadata.startTime + startTime,
			)
			const endIdx = endTime
				? getChunkIdx(state.sessionMetadata.startTime + endTime)
				: startIdx

			const promises = []
			log(
				'PlayerHook.tsx',
				'checking chunk loaded status range',
				startIdx,
				endIdx,
			)
			for (let i = startIdx; i <= endIdx; i++) {
				log(
					'PlayerHook.tsx',
					'hasChunk',
					i,
					chunkEventsRef.current.has(i),
				)
				if (loadingChunks.current.has(i)) {
					log(
						'PlayerHook.tsx',
						'ensureChunksLoaded waiting for loading chunk',
						i,
					)
				} else if (!chunkEventsRef.current.has(i)) {
					loadingChunks.current.add(i)
					chunkEventsSet(i, [])

					// signal that we are loading chunks once
					if (!promises.length) {
						if (action || i == startIdx) {
							log(
								'PlayerHook.tsx',
								'ensureChunksLoaded needs blocking load for chunk',
								i,
							)
							dispatch({
								type: PlayerActionType.startChunksLoad,
							})
						}
					}
					promises.push(
						(async (_i: number) => {
							try {
								const response = await fetchEventChunkURL({
									secure_id: session_secure_id,
									index: _i,
								})
								const chunkResponse = await fetch(
									response.data.event_chunk_url,
								)
								chunkEventsSet(
									_i,
									toHighlightEvents(
										await chunkResponse.json(),
									),
								)
								loadingChunks.current.delete(_i)
								log('PlayerHook.tsx', 'set data for chunk', _i)
							} catch (e: any) {
								H.consumeError(
									e,
									'Error direct downloading session payload',
								)
								return [_i, []]
							}
						})(i),
					)
				}
			}
			if (promises.length) {
				const toRemove = getChunksToRemove(
					chunkEventsRef.current,
					startIdx,
				)
				if (currentChunkIdx.current) {
					toRemove.delete(currentChunkIdx.current)
				}
				log('PlayerHook.tsx', 'getChunksToRemove', {
					after: chunkEventsRef.current,
					toRemove,
				})
				toRemove.forEach((idx) => chunkEventsRemove(idx))
				await Promise.all(promises)
			}
			if (!loadingChunks.current.size && promises.length) {
				log(
					'PlayerHook.tsx',
					'ensureChunksLoaded',
					'calling dispatchAction due to loading',
					{
						time: lastTimeRef.current,
						promises,
						chunks: chunkEventsRef.current,
					},
				)
				dispatchAction(lastTimeRef.current)
			} else if (action) {
				log(
					'PlayerHook.tsx',
					'ensureChunksLoaded',
					'calling dispatchAction due to action',
					{
						startTime,
						action,
						chunks: chunkEventsRef.current,
					},
				)
				dispatchAction(startTime, action)
			}
		},
		[
			project_id,
			state.session?.chunked,
			state.sessionMetadata.startTime,
			getChunkIdx,
			dispatchAction,
			chunkEventsRef,
			chunkEventsSet,
			fetchEventChunkURL,
			session_secure_id,
			getChunksToRemove,
			chunkEventsRemove,
		],
	)

	const onFrame = useMemo(
		() =>
			_.throttle(() => {
				dispatch({
					type: PlayerActionType.onFrame,
				})
			}, FRAME_MS * 10),
		[],
	)

	const play = useCallback(
		(time?: number): Promise<void> => {
			const newTime = time ?? 0
			// Don't play the session if the player is already at the end of the session.
			if (newTime >= state.sessionEndTime) {
				return Promise.resolve()
			}

			dispatch({ type: PlayerActionType.setTime, time: newTime })
			return new Promise<void>((r) =>
				requestAnimationFrame(() =>
					ensureChunksLoaded(
						newTime,
						undefined,
						ReplayerState.Playing,
					).then(() => {
						// Log how long it took to move to the new time.
						const timelineChangeTime =
							timerEnd('timelineChangeTime')
						datadogLogs.logger.info('Timeline Play Time', {
							duration: timelineChangeTime,
							sessionId: state.session_secure_id,
						})
						r()
					}),
				),
			)
		},
		[ensureChunksLoaded, state.sessionEndTime, state.session_secure_id],
	)

	const pause = useCallback(
		(time?: number): Promise<void> => {
			if (time) {
				dispatch({ type: PlayerActionType.setTime, time })
			}
			return new Promise<void>((r) =>
				requestAnimationFrame(() =>
					ensureChunksLoaded(
						time ?? 0,
						undefined,
						ReplayerState.Paused,
					).then(() => {
						// Log how long it took to move to the new time.
						const timelineChangeTime =
							timerEnd('timelineChangeTime')
						datadogLogs.logger.info('Timeline Pause Time', {
							duration: timelineChangeTime,
							sessionId: state.session_secure_id,
						})
						r()
					}),
				),
			)
		},
		[ensureChunksLoaded, state.session_secure_id],
	)

	const seek = useCallback(
		(time: number): Promise<void> => {
			if (!state.isLiveMode && skipInactive) {
				const inactivityEnd = getInactivityEnd(time)
				if (inactivityEnd) {
					log(
						'PlayerHook.tsx',
						'seeking to',
						inactivityEnd,
						'due to inactivity at seek requested for',
						time,
					)
					time = inactivityEnd
				}
			}
			dispatch({ type: PlayerActionType.setTime, time })
			return new Promise<void>((r) =>
				requestAnimationFrame(() =>
					ensureChunksLoaded(
						time,
						undefined,
						state.replayerState,
					).then(r),
				),
			)
		},
		[
			ensureChunksLoaded,
			getInactivityEnd,
			skipInactive,
			state.isLiveMode,
			state.replayerState,
		],
	)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const onEvent = useCallback(
		_.throttle((e) => {
			const event = e as HighlightEvent
			if (
				usefulEvent(event) ||
				(event as customEvent)?.data?.tag === 'Stop' ||
				event.type === 5
			) {
				dispatch({
					type: PlayerActionType.onEvent,
					event: e as HighlightEvent,
				})
			}
		}, FRAME_MS * 60),
		[],
	)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const onPlayStartStop = useCallback(
		_.throttle(() => {
			if (!state.replayer) return
			dispatch({
				type: PlayerActionType.updateCurrentUrl,
				currentTime:
					getTimeFromReplayer(state.replayer, state.sessionMetadata) +
					state.sessionMetadata.startTime,
			})
		}, FRAME_MS * 60),
		[],
	)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const onViewportChange = useCallback(
		_.throttle((_e) => {
			dispatch({
				type: PlayerActionType.updateViewport,
				viewport: _e as viewportResizeDimension,
			})
		}, FRAME_MS * 60),
		[],
	)

	// Initializes the session state and fetches the session data
	useEffect(() => {
		resetPlayer(
			project_id && session_secure_id
				? ReplayerState.Loading
				: ReplayerState.Empty,
		)
	}, [project_id, session_secure_id, resetPlayer])

	useEffect(() => {
		if (
			state.isLiveMode &&
			sessionPayload?.events &&
			!unsubscribeSessionPayloadFn.current &&
			subscribeToSessionPayload
		) {
			log('PlayerHook.tsx', 'live mode subscribing')
			unsubscribeSessionPayloadFn.current = subscribeToSessionPayload({
				document: OnSessionPayloadAppendedDocument,
				variables: {
					session_secure_id,
					initial_events_count: sessionPayload.events.length,
				},
				updateQuery: (prev, { subscriptionData }) => {
					log('PlayerHook.tsx', 'live mode update', {
						subscriptionData,
					})
					if (subscriptionData.data) {
						const sd = subscriptionData.data
						// @ts-ignore The typedef for subscriptionData is incorrect, apollo creates _appended type
						const newEvents = sd!.session_payload_appended.events!
						if (newEvents.length) {
							const events = [
								...(chunkEventsRef.current.get(0) || []),
								...toHighlightEvents(newEvents),
							]
							chunkEventsSet(0, events)
							dispatch({
								type: PlayerActionType.addLiveEvents,
								lastActiveTimestamp: new Date(
									// @ts-ignore The typedef for subscriptionData is incorrect, apollo creates _appended type
									subscriptionData.data!.session_payload_appended.last_user_interaction_time,
								).getTime(),
							})
						}
					}
					// Prev is the value in Apollo cache - it is empty, don't bother updating it
					return prev
				},
			})
			play(state.time).then()
		} else if (!state.isLiveMode && unsubscribeSessionPayloadFn.current) {
			unsubscribeSessionPayloadFn.current()
			unsubscribeSessionPayloadFn.current = undefined
			pause().then()
		}
		// We don't want to re-evaluate this every time the play/pause fn changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		state.isLiveMode,
		sessionPayload?.events,
		state.replayerState,
		subscribeToSessionPayload,
		session_secure_id,
		chunkEventsSet,
	])

	useEffect(() => {
		if (state.replayer && state.session?.secure_id !== session_secure_id) {
			dispatch({
				type: PlayerActionType.updateCurrentUrl,
				currentTime:
					getTimeFromReplayer(state.replayer, state.sessionMetadata) +
					state.sessionMetadata.startTime,
			})
		}
	}, [
		state.session?.secure_id,
		session_secure_id,
		state.replayer,
		state.sessionMetadata,
	])

	useEffect(() => {
		const searchParamsObject = new URLSearchParams(location.search)
		if (searchParamsObject.get(PlayerSearchParameters.errorId)) {
			setShowLeftPanel(false)
			setShowRightPanel(true)
		}
	}, [setShowLeftPanel, setShowRightPanel])

	// set event listeners for the replayer
	useEffect(() => {
		if (!state.replayer) {
			return
		}
		state.replayer.on('event-cast', onEvent)
		state.replayer.on('resize', onViewportChange)
		state.replayer.on('pause', onPlayStartStop)
		state.replayer.on('start', onPlayStartStop)
	}, [state.replayer, project_id, onEvent, onViewportChange, onPlayStartStop])

	// Downloads the events data only if the URL search parameter '?download=1' is present.
	useEffect(() => {
		if (download) {
			const directDownloadUrl = sessionData?.session?.direct_download_url

			if (directDownloadUrl) {
				const handleDownload = (events: HighlightEvent[]): void => {
					const a = document.createElement('a')
					const file = new Blob([JSON.stringify(events)], {
						type: 'application/json',
					})

					a.href = URL.createObjectURL(file)
					a.download = `session-${session_secure_id}.json`
					a.click()

					URL.revokeObjectURL(a.href)
				}

				fetch(directDownloadUrl)
					.then((response) => response.json())
					.then((data) => {
						return toHighlightEvents(data || [])
					})
					.then(handleDownload)
					.catch((e) => {
						H.consumeError(
							e,
							'Error direct downloading session payload for download',
						)
					})
			}
		}
	}, [download, sessionData?.session?.direct_download_url, session_secure_id])

	useEffect(() => {
		if (!sessionPayload || !sessionIntervals || !timelineIndicatorEvents)
			return
		// If events are returned by getSessionPayloadQuery, set the events payload
		if (!!sessionPayload?.events?.length) {
			chunkEventsSet(0, toHighlightEvents(sessionPayload?.events))
			dispatchAction(0, ReplayerState.Paused)
		}
		dispatch({
			type: PlayerActionType.onSessionPayloadLoaded,
			sessionPayload,
			sessionIntervals,
			timelineIndicatorEvents,
		})
		if (state.replayerState <= ReplayerState.Loading) {
			pause().then()
		}
		setPlayerTimestamp(
			state.sessionMetadata.totalTime,
			state.sessionMetadata.startTime,
			state.errors,
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		sessionPayload,
		sessionIntervals,
		timelineIndicatorEvents,
		chunkEventsSet,
	])

	useEffect(() => {
		if (state.replayer) {
			state.replayer.setConfig({ mouseTail: showPlayerMouseTail })
		}
	}, [state.replayer, showPlayerMouseTail])

	// "Subscribes" the time with the Replayer when the Player is playing.
	useEffect(() => {
		if (
			(state.replayerState === ReplayerState.Playing ||
				state.isLiveMode) &&
			!animationFrameID.current
		) {
			const frameAction = () => {
				if (state.replayer) {
					// The player may start later than the session if earlier events are unloaded
					onFrame()
				}
				animationFrameID.current = requestAnimationFrame(frameAction)
			}
			animationFrameID.current = requestAnimationFrame(frameAction)
		} else if (
			animationFrameID.current &&
			!(state.replayerState === ReplayerState.Playing || state.isLiveMode)
		) {
			window.cancelAnimationFrame(animationFrameID.current)
			animationFrameID.current = 0
		}
	}, [
		onFrame,
		session_secure_id,
		state.isLiveMode,
		state.replayer,
		state.replayerState,
	])

	useEffect(() => {
		if (
			state.replayerState !== ReplayerState.Playing &&
			!state.isLiveMode &&
			animationFrameID.current
		) {
			cancelAnimationFrame(animationFrameID.current)
			animationFrameID.current = 0
		}
	}, [state.replayerState, state.isLiveMode])

	useEffect(() => {
		setPlayerTimeToPersistance(state.time)
	}, [setPlayerTimeToPersistance, state.time])

	// Finds the next session in the session feed to play if autoplay is enabled.
	useEffect(() => {
		if (
			state.replayerState === ReplayerState.SessionEnded &&
			autoPlaySessions &&
			state.sessionResults.sessions.length > 0
		) {
			const nextSessionInList = findNextSessionInList(
				state.sessionResults.sessions,
				session_secure_id,
			)

			if (nextSessionInList) {
				pause(state.time).then(() => {
					resetPlayer(ReplayerState.Empty)
					history.push(
						`/${project_id}/sessions/${nextSessionInList.secure_id}`,
					)
				})
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		autoPlaySessions,
		history,
		pause,
		project_id,
		resetPlayer,
		session_secure_id,
		state.replayerState,
		state.sessionResults.sessions,
	])

	// ensures that chunks are loaded in advance during playback
	// ensures we skip over inactivity periods
	useEffect(() => {
		lastTimeRef.current = state.time
		if (
			!state.session?.processed ||
			state.sessionMetadata.startTime === 0 ||
			state.replayerState !== ReplayerState.Playing ||
			session_secure_id !== state.session_secure_id
		) {
			return
		}
		// If the player is in an inactive interval, skip to the end of it
		let inactivityEnd: number | undefined
		if (
			!state.isLiveMode &&
			skipInactive &&
			state.replayerState === ReplayerState.Playing
		) {
			inactivityEnd = getInactivityEnd(state.time)
			if (inactivityEnd !== undefined) {
				log(
					'PlayerHook.tsx',
					'seeking to',
					inactivityEnd,
					'due to inactivity at',
					state.time,
				)
				play(inactivityEnd).then()
				return
			}
		}
		ensureChunksLoaded(state.time, state.time + LOOKAHEAD_MS).then()
	}, [
		state.time,
		ensureChunksLoaded,
		state.sessionMetadata.startTime,
		state.session?.processed,
		state.replayerState,
		skipInactive,
		getInactivityEnd,
		play,
		state.isLiveMode,
		state.session_secure_id,
		session_secure_id,
	])

	useEffect(() => {
		if (state.eventsLoaded && autoPlayVideo) {
			log('PlayerHook.tsx', 'Auto Playing')
			dispatch({
				type: PlayerActionType.play,
				time: 0,
			})
		}
	}, [autoPlayVideo, state.eventsLoaded])

	return {
		...state,
		setScale: (scale) =>
			dispatch({ type: PlayerActionType.setScale, scale }),
		setTime: seek,
		state: state.replayerState,
		play,
		pause,
		canViewSession:
			state.sessionViewability === SessionViewability.VIEWABLE,
		setSessionResults: (sessionResults) =>
			dispatch({
				type: PlayerActionType.setSessionResults,
				sessionResults,
			}),
		isPlayerReady:
			state.replayerState !== ReplayerState.Loading &&
			state.replayerState !== ReplayerState.Empty &&
			state.scale !== 1 &&
			state.sessionViewability === SessionViewability.VIEWABLE,
		setIsLiveMode: (isLiveMode) => {
			dispatch({
				type: PlayerActionType.addLiveEvents,
				lastActiveTimestamp: state.lastActiveTimestamp,
			})
			dispatch({ type: PlayerActionType.setIsLiveMode, isLiveMode })
		},
		playerProgress: state.replayer
			? state.time / state.sessionMetadata.totalTime
			: null,
		sessionStartDateTime: state.sessionMetadata.startTime,
		setViewingUnauthorizedSession: (viewingUnauthorizedSession) =>
			dispatch({
				type: PlayerActionType.setViewingUnauthorizedSession,
				viewingUnauthorizedSession,
			}),
		setCurrentEvent: (currentEvent) =>
			dispatch({
				type: PlayerActionType.setCurrentEvent,
				currentEvent,
			}),
	}
}
