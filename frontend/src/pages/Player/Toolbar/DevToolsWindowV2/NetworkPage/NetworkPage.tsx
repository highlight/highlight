import LoadingBox from '@components/LoadingBox'
import {
	Box,
	Callout,
	IconSolidArrowCircleRight,
	IconSolidExclamation,
	Tag,
	Text,
} from '@highlight-run/ui'
import { getResponseStatusCode } from '@pages/Player/helpers'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import {
	LoadingError,
	useResourcesContext,
} from '@pages/Player/ResourcesContext/ResourcesContext'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import {
	findLastActiveEventIndex,
	getHighlightRequestId,
	getNetworkResourcesDisplayName,
	NetworkResource,
	RequestStatus,
	RequestType,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { useParams } from '@util/react-router/useParams'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { formatTime, MillisToMinutesAndSeconds } from '@util/time'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import { ErrorObject } from '@/graph/generated/schemas'
import { useActiveNetworkResourceId } from '@/hooks/useActiveNetworkResourceId'
import { styledVerticalScrollbar } from '@/style/common.css'

import TextHighlighter from '../../../../../components/TextHighlighter/TextHighlighter'
import Tooltip from '../../../../../components/Tooltip/Tooltip'
import { ReplayerState, useReplayerContext } from '../../../ReplayerContext'
import * as styles from './style.css'

export const NetworkPage = ({
	time,
	autoScroll,
	filter,
	requestTypes,
	requestStatuses,
}: {
	time: number
	autoScroll: boolean
	filter: string
	requestTypes: RequestType[]
	requestStatuses: RequestStatus[]
}) => {
	const { state, session, isPlayerReady, errors, setTime, sessionMetadata } =
		useReplayerContext()
	const startTime = sessionMetadata.startTime
	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const { setActiveNetworkResourceId } = useActiveNetworkResourceId()
	const { session_secure_id } = useParams<{ session_secure_id: string }>()

	const virtuoso = useRef<VirtuosoHandle>(null)

	const {
		resources: parsedResources,
		loadResources,
		resourcesLoading: loading,
		error: resourceLoadingError,
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
						requestTypes.includes(RequestType.All) ||
						requestTypes.includes(
							request.initiatorType as RequestType,
						),
				)
				.filter((request) => {
					/* No filter for RequestStatus.All */
					if (requestStatuses.includes(RequestStatus.All)) {
						return true
					}
					/* Filter on RequestStatus */
					const status =
						request?.requestResponsePairs?.response?.status
					if (status) {
						const statusString = status.toString()
						/* '1', '2', '3', '4', '5', '?' */
						const selectedRequestStatusGroups = requestStatuses.map(
							(status) => status[0],
						)
						if (
							selectedRequestStatusGroups.includes(
								statusString[0],
							)
						) {
							return true
						}
					} else {
						if (
							[RequestType.Fetch, RequestType.XHR].includes(
								request.initiatorType as RequestType,
							)
						) {
							return requestStatuses.includes(
								RequestStatus.Unknown,
							)
						} else if (
							request.initiatorType === RequestType.WebSocket
						) {
							return requestStatuses.includes(
								RequestStatus['1XX'],
							)
						} else {
							// this is a network request with no status code, so we assume 2xx
							return requestStatuses.includes(
								RequestStatus['2XX'],
							)
						}
					}
				}) as NetworkResource[]) ?? []

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
	}, [parsedResources, filter, requestTypes, requestStatuses])

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

	return (
		<Box className={styles.container}>
			{resourceLoadingError ? (
				<ResourceLoadingErrorCallout error={resourceLoadingError} />
			) : !isPlayerReady || loading || !session ? (
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
								const requestErrors = errors.filter(
									(e) => e.request_id === requestId,
								)
								return (
									<ResourceRow
										key={index.toString()}
										resource={resource}
										networkRange={networkRange}
										isCurrentResource={
											currentResourceIdx === index
										}
										searchTerm={filter}
										onClickHandler={() => {
											setActiveNetworkResourceId(
												resource.id,
											)
										}}
										setActiveNetworkResourceId={
											setActiveNetworkResourceId
										}
										setTime={setTime}
										playerStartTime={startTime}
										errors={requestErrors}
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
						requestTypes={requestTypes}
						requestStatuses={requestStatuses}
					/>
				)
			)}
		</Box>
	)
}

interface ResourceRowProps {
	resource: NetworkResource
	networkRange: number
	isCurrentResource: boolean
	searchTerm: string
	onClickHandler: () => void
	setActiveNetworkResourceId: (resource: number | undefined) => void
	setTime: (time: number) => void
	networkRequestAndResponseRecordingEnabled: boolean
	playerStartTime: number
	errors?: ErrorObject[]
	showPlayerAbsoluteTime?: boolean
}

const ResourceRow = ({
	resource,
	networkRange,
	isCurrentResource,
	searchTerm,
	onClickHandler,
	setActiveNetworkResourceId,
	networkRequestAndResponseRecordingEnabled,
	setTime,
	playerStartTime,
	errors,
	showPlayerAbsoluteTime,
}: ResourceRowProps) => {
	const leftPaddingPercent = (resource.startTime / networkRange) * 100
	const actualPercent = Math.max(
		((resource.responseEnd - resource.startTime) / networkRange) * 100,
		0.1,
	)
	const rightPaddingPercent = 100 - actualPercent - leftPaddingPercent

	const { activeNetworkResourceId } = useActiveNetworkResourceId()
	const showingDetails = activeNetworkResourceId === resource.id
	const responseStatus = resource.requestResponsePairs?.response.status
	const bodyErrors = hasErrorsInBody(resource)

	const hasError =
		bodyErrors ||
		!!errors?.length ||
		!!resource.errors?.length ||
		!!(responseStatus === 0 || (responseStatus && responseStatus >= 400))
	const reponseStatuscode = getResponseStatusCode(resource)

	return (
		<Box
			key={resource.id.toString()}
			onClick={onClickHandler}
			cursor="pointer"
		>
			<Box
				borderBottom="dividerWeak"
				cssClass={styles.networkRowVariants({
					current: isCurrentResource,
					failedResource: hasError,
					showingDetails,
				})}
			>
				<Text
					size="small"
					weight={showingDetails ? 'bold' : 'medium'}
					lines="1"
				>
					{reponseStatuscode === 'Unknown' ? (
						<UnknownRequestStatusCode
							networkRequestAndResponseRecordingEnabled={
								networkRequestAndResponseRecordingEnabled
							}
						/>
					) : (
						reponseStatuscode
					)}
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
					{resource.responseEnd && resource.startTime
						? formatTime(resource.responseEnd - resource.startTime)
						: 'N/A'}
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
						event.stopPropagation() // prevent panel from closing when clicking a resource
						setTime(resource.startTime)
						setActiveNetworkResourceId(resource.id)
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
			Unknown
		</Tooltip>
	)
}

const ResourceLoadingErrorCallout = function ({
	error,
}: {
	error: LoadingError
}) {
	return (
		<Box
			height="full"
			width="full"
			display="flex"
			alignItems="center"
			justifyContent="center"
		>
			<Callout
				border
				title={`Failed to load session network resources: ${error}`}
				icon={() => (
					<Box
						borderRadius="5"
						style={{
							alignItems: 'center',
							backgroundColor: '#E9E9E9',
							display: 'flex',
							height: 22,
							justifyContent: 'center',
							textAlign: 'center',
							width: 22,
						}}
					>
						<IconSolidExclamation size={14} color="#777777" />
					</Box>
				)}
			/>
		</Box>
	)
}

const hasErrorsInBody = (resource: NetworkResource): boolean => {
	const body = resource?.requestResponsePairs?.response.body

	if (!body) {
		return false
	}

	try {
		let parsedResponseBody: { [key: string]: any } = {}
		if (typeof body === 'object') {
			parsedResponseBody = JSON.parse(JSON.stringify(body))
		} else {
			parsedResponseBody = JSON.parse(body)
		}

		const errors = parsedResponseBody.errors
		return Array.isArray(errors) ? errors.length > 0 : !!errors
	} catch (error) {
		return false
	}
}
