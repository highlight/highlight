import LoadingBox from '@components/LoadingBox'
import { Box, IconSolidArrowCircleRight, Tag, Text } from '@highlight-run/ui'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useResourcesContext } from '@pages/Player/ResourcesContext/ResourcesContext'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import {
	findLastActiveEventIndex,
	findResourceWithMatchingHighlightHeader,
	getHighlightRequestId,
	getNetworkResourcesDisplayName,
	NetworkResource,
	RequestStatus,
	RequestType,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { formatTime, MillisToMinutesAndSeconds } from '@util/time'
import { message } from 'antd'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { styledVerticalScrollbar } from 'style/common.css'

import TextHighlighter from '../../../../../components/TextHighlighter/TextHighlighter'
import Tooltip from '../../../../../components/Tooltip/Tooltip'
import { ReplayerState, useReplayerContext } from '../../../ReplayerContext'
import * as styles from './style.css'

export const NetworkPage = ({
	time,
	autoScroll,
	filter,
	requestType,
	requestStatus,
}: {
	time: number
	autoScroll: boolean
	filter: string
	requestType: RequestType
	requestStatus: RequestStatus
}) => {
	const {
		state,
		session,
		isPlayerReady,
		errors,
		replayer,
		setTime,
		sessionMetadata,
	} = useReplayerContext()
	const startTime = sessionMetadata.startTime
	const {
		setShowDevTools,
		setSelectedDevToolsTab,
		setShowRightPanel,
		showPlayerAbsoluteTime,
	} = usePlayerConfiguration()
	const {
		setActiveError,
		setActiveNetworkResource,
		rightPanelView,
		setRightPanelView,
	} = usePlayerUIContext()

	const { session_secure_id } = useParams<{ session_secure_id: string }>()

	const [currentActiveIndex, setCurrentActiveIndex] = useState<number>()

	const virtuoso = useRef<VirtuosoHandle>(null)
	const errorId = new URLSearchParams(location.search).get(
		PlayerSearchParameters.errorId,
	)

	const {
		resources: parsedResources,
		loadResources,
		resourcesLoading: loading,
	} = useResourcesContext()
	useEffect(() => {
		loadResources()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session_secure_id])

	const networkRange = useMemo(() => {
		if (parsedResources.length > 0) {
			const start = parsedResources[0].startTime
			const end = parsedResources[parsedResources.length - 1].responseEnd
			return end - start
		}
		return 0
	}, [parsedResources])

	const resourcesToRender = useMemo(() => {
		const current =
			(parsedResources
				.filter(
					(request) =>
						requestType === RequestType.All ||
						requestType === request.initiatorType,
				)
				.filter((request) => {
					/* No filter for RequestStatus.All */
					if (requestStatus === RequestStatus.All) {
						return true
					}
					/* Filter on RequestStatus */
					const status =
						request?.requestResponsePairs?.response?.status
					if (status) {
						const statusString = status.toString()
						/* '1', '2', '3', '4', '5', '?' */
						if (requestStatus[0] === statusString[0]) {
							return true
						}
					}
					return false
				})
				.map((event) => ({
					...event,
					timestamp: event.startTime + startTime,
				})) as NetworkResource[]) ?? []

		if (filter !== '') {
			return current.filter((resource) => {
				if (!resource.name) {
					return false
				}

				return (resource.displayName || resource.name)
					.toLocaleLowerCase()
					.includes(filter.toLocaleLowerCase())
			})
		}

		return current
	}, [parsedResources, filter, requestType, requestStatus, startTime])

	const currentResourceIdx = useMemo(() => {
		return findLastActiveEventIndex(
			Math.round(time),
			startTime,
			resourcesToRender,
		)
	}, [resourcesToRender, startTime, time])

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const scrollFunction = useCallback(
		_.debounce((index: number) => {
			requestAnimationFrame(() => {
				if (virtuoso.current) {
					virtuoso.current.scrollToIndex({
						index,
						align: 'center',
						behavior: 'smooth',
					})
				}
			})
		}, 1000 / 60),
		[],
	)

	useEffect(() => {
		if (
			errorId &&
			!loading &&
			!!session &&
			!!resourcesToRender &&
			resourcesToRender.length > 0 &&
			!!errors &&
			errors.length > 0 &&
			isPlayerReady
		) {
			const matchingError = errors.find((e) => e.id === errorId)
			if (matchingError && matchingError.request_id) {
				const resource = findResourceWithMatchingHighlightHeader(
					matchingError.request_id,
					resourcesToRender,
				)
				if (resource) {
					setActiveNetworkResource(resource)
					setTime(resource.startTime)
					scrollFunction(resourcesToRender.indexOf(resource))
					message.success(
						`Changed player time to when error was thrown at ${MillisToMinutesAndSeconds(
							resource.startTime,
						)}.`,
					)
				} else {
					setSelectedDevToolsTab(Tab.Errors)
					setActiveError(matchingError)
					setRightPanelView(RightPanelView.Error)
					analytics.track(
						'FailedToMatchHighlightResourceHeaderWithResource',
					)
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		resourcesToRender,
		errors,
		isPlayerReady,
		loading,
		replayer,
		scrollFunction,
		session,
		setSelectedDevToolsTab,
		setShowDevTools,
	])

	useEffect(() => {
		if (autoScroll && state === ReplayerState.Playing) {
			scrollFunction(currentResourceIdx)
		}
	}, [currentResourceIdx, scrollFunction, autoScroll, state])

	useEffect(() => {
		// scroll network events on player timeline click
		if (autoScroll && state === ReplayerState.Paused) {
			scrollFunction(currentResourceIdx)
		}
	}, [autoScroll, currentResourceIdx, scrollFunction, state, time])

	// Sets up a keydown listener to allow the user to quickly view network requests details in the resource panel by using the up/down arrow key.
	/* Note - this event collides with the "CMD + up" and "CMD + down" command for controlling player speed */
	useEffect(() => {
		const listener = (e: KeyboardEvent) => {
			let direction: undefined | number = undefined
			if (e.key === 'ArrowUp') {
				direction = -1
			} else if (e.key === 'ArrowDown') {
				direction = 1
			}

			if (direction !== undefined) {
				e.preventDefault()
				let nextIndex = (currentActiveIndex || 0) + direction
				if (nextIndex < 0) {
					nextIndex = 0
				} else if (nextIndex >= resourcesToRender.length) {
					nextIndex = resourcesToRender.length - 1
				}

				setCurrentActiveIndex(nextIndex)
				const isPanelOpen =
					rightPanelView === RightPanelView.NetworkResource
				if (isPanelOpen) {
					requestAnimationFrame(() => {
						setActiveNetworkResource(resourcesToRender[nextIndex])
						virtuoso.current?.scrollToIndex(nextIndex - 1)
					})
				}
			}
		}
		document.addEventListener('keydown', listener, { passive: false })

		return () => {
			document.removeEventListener('keydown', listener)
		}
	}, [
		currentActiveIndex,
		resourcesToRender,
		rightPanelView,
		setActiveNetworkResource,
	])

	return (
		<Box className={styles.container}>
			{!isPlayerReady || loading || !session ? (
				<LoadingBox />
			) : resourcesToRender.length > 0 ? (
				<Box className={styles.container}>
					<Box className={styles.networkHeader}>
						<Text color="n11">Status</Text>
						<Text color="n11">Type</Text>
						<Text color="n11">Name</Text>
						<Text color="n11">Time</Text>
						<Text color="n11">Latency</Text>
						<Text color="n11">Waterfall</Text>
					</Box>
					<Box className={styles.networkBox}>
						<Virtuoso
							ref={virtuoso}
							overscan={1024}
							increaseViewportBy={1024}
							className={styledVerticalScrollbar}
							components={{
								ScrollSeekPlaceholder: () => (
									<div
										style={{
											height: 36,
										}}
									/>
								),
							}}
							scrollSeekConfiguration={{
								enter: (v) => v > 512,
								exit: (v) => v < 128,
							}}
							data={resourcesToRender}
							itemContent={(index, resource) => {
								const requestId =
									getHighlightRequestId(resource)
								const error = errors.find(
									(e) => e.request_id === requestId,
								)
								return (
									<ResourceRow
										key={index.toString()}
										index={index}
										resource={resource}
										networkRange={networkRange}
										isCurrentResource={
											currentResourceIdx === index
										}
										searchTerm={filter}
										onClickHandler={() => {
											setCurrentActiveIndex(index)
											setActiveNetworkResource(resource)
											setShowRightPanel(true)
											setRightPanelView(
												RightPanelView.NetworkResource,
											)
										}}
										setCurrentActiveIndex={
											setCurrentActiveIndex
										}
										setActiveNetworkResource={
											setActiveNetworkResource
										}
										setTime={setTime}
										playerStartTime={startTime}
										hasError={!!error}
										networkRequestAndResponseRecordingEnabled={
											session.enable_recording_network_contents ||
											false
										}
										showPlayerAbsoluteTime={
											showPlayerAbsoluteTime
										}
									/>
								)
							}}
						/>
					</Box>
				</Box>
			) : (
				resourcesToRender.length === 0 && (
					<EmptyDevToolsCallout
						kind={Tab.Network}
						filter={filter}
						requestType={requestType}
						requestStatus={requestStatus}
					/>
				)
			)}
		</Box>
	)
}

interface ResourceRowProps {
	index: number
	resource: NetworkResource
	networkRange: number
	isCurrentResource: boolean
	searchTerm: string
	onClickHandler: () => void
	setCurrentActiveIndex: React.Dispatch<
		React.SetStateAction<number | undefined>
	>
	setActiveNetworkResource: React.Dispatch<
		React.SetStateAction<NetworkResource | undefined>
	>
	setTime: (time: number) => void
	networkRequestAndResponseRecordingEnabled: boolean
	playerStartTime: number
	hasError?: boolean
	showPlayerAbsoluteTime?: boolean
}

const ResourceRow = ({
	index,
	resource,
	networkRange,
	isCurrentResource,
	searchTerm,
	onClickHandler,
	setCurrentActiveIndex,
	setActiveNetworkResource,
	networkRequestAndResponseRecordingEnabled,
	setTime,
	playerStartTime,
	hasError,
	showPlayerAbsoluteTime,
}: ResourceRowProps) => {
	const leftPaddingPercent = (resource.startTime / networkRange) * 100
	const actualPercent = Math.max(
		((resource.responseEnd - resource.startTime) / networkRange) * 100,
		0.1,
	)
	const rightPaddingPercent = 100 - actualPercent - leftPaddingPercent
	const { activeNetworkResource } = usePlayerUIContext()

	const showingDetails = activeNetworkResource?.id === resource.id
	return (
		<Box key={resource.id.toString()} onClick={onClickHandler}>
			<Box
				borderBottom="dividerWeak"
				cssClass={styles.networkRowVariants({
					current: isCurrentResource,
					failedResource: !!(
						hasError ||
						(resource.requestResponsePairs?.response.status &&
							(resource.requestResponsePairs.response.status ===
								0 ||
								resource.requestResponsePairs.response.status >=
									400))
					),
					showingDetails,
				})}
			>
				<Text
					size="small"
					weight={showingDetails ? 'bold' : 'medium'}
					lines="1"
				>
					{/* NOTE - Showing '200' for all requests that aren't 'xmlhttprequest' or 'fetch' */}
					{resource.initiatorType === 'xmlhttprequest' ||
					resource.initiatorType === 'fetch'
						? resource.requestResponsePairs?.response.status ?? (
								<UnknownRequestStatusCode
									networkRequestAndResponseRecordingEnabled={
										networkRequestAndResponseRecordingEnabled
									}
								/>
						  )
						: '200'}
				</Text>
				<Text
					size="small"
					weight={showingDetails ? 'bold' : 'medium'}
					lines="1"
				>
					{getNetworkResourcesDisplayName(resource.initiatorType)}
				</Text>
				<Tooltip title={resource.displayName || resource.name}>
					<TextHighlighter
						className={styles.nameSection}
						searchWords={[searchTerm]}
						autoEscape={true}
						textToHighlight={resource.displayName || resource.name}
					/>
				</Tooltip>
				<Text
					size="small"
					weight={showingDetails ? 'bold' : 'medium'}
					lines="1"
				>
					{showPlayerAbsoluteTime
						? playerTimeToSessionAbsoluteTime({
								sessionStartTime: playerStartTime,
								relativeTime: resource.startTime,
						  })
						: MillisToMinutesAndSeconds(resource.startTime)}
				</Text>
				<Text size="small" weight={showingDetails ? 'bold' : 'medium'}>
					{formatTime(resource.responseEnd - resource.startTime)}
				</Text>
				<Box className={styles.timingBarWrapper}>
					<Box
						style={{
							width: `${leftPaddingPercent}%`,
						}}
						className={styles.timingBarEmptySection}
					/>
					<Box
						className={styles.timingBar}
						style={{
							width: `${actualPercent}%`,
						}}
					/>
					<Box
						style={{
							width: `${rightPaddingPercent}%`,
						}}
						className={styles.timingBarEmptySection}
					/>
				</Box>
				<Tag
					shape="basic"
					emphasis="low"
					kind="secondary"
					size="medium"
					onClick={(event) => {
						setTime(resource.startTime)
						event.stopPropagation() /* Prevents opening of right panel by parent row's onClick handler */
						setCurrentActiveIndex(index)
						setActiveNetworkResource(resource)
					}}
				>
					<IconSolidArrowCircleRight />
				</Tag>
			</Box>
		</Box>
	)
}

export const UnknownRequestStatusCode = ({
	networkRequestAndResponseRecordingEnabled,
}: {
	networkRequestAndResponseRecordingEnabled: boolean
}) => {
	return (
		<Tooltip
			title={
				!networkRequestAndResponseRecordingEnabled ? (
					<>
						To enable recording status codes for XHR/Fetch requests,
						you need to enable{' '}
						<a
							href="https://docs.highlight.run/recording-network-requests-and-responses"
							target="_blank"
							rel="noreferrer"
						>
							recording network requests and responses
						</a>
						.
					</>
				) : (
					"Highlight wasn't able to get the status code for this request."
				)
			}
		>
			???
		</Tooltip>
	)
}
