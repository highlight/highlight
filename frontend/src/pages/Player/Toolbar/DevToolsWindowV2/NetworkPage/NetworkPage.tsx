import { Box, Text } from '@highlight-run/ui'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useResourcesContext } from '@pages/Player/ResourcesContext/ResourcesContext'
import { DevToolTabType } from '@pages/Player/Toolbar/DevToolsContext/DevToolsContext'
import { getNetworkResourcesDisplayName } from '@pages/Player/Toolbar/DevToolsWindow/Option/Option'
import { useResourceOrErrorDetailPanel } from '@pages/Player/Toolbar/DevToolsWindow/ResourceOrErrorDetailPanel/ResourceOrErrorDetailPanel'
import {
	findLastActiveEventIndex,
	findResourceWithMatchingHighlightHeader,
	getHighlightRequestId,
	NetworkResource,
	RequestType,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import analytics from '@util/analytics'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import { message } from 'antd'
import clsx from 'clsx'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import TextHighlighter from '../../../../../components/TextHighlighter/TextHighlighter'
import Tooltip from '../../../../../components/Tooltip/Tooltip'
import { ReplayerState, useReplayerContext } from '../../../ReplayerContext'
import * as styles from './style.css'

export const NetworkPage = React.memo(
	({
		time,
		autoScroll,
		filter,
		requestType,
	}: {
		time: number
		autoScroll: boolean
		filter: string
		requestType: RequestType
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
		const { setShowDevTools, setSelectedDevToolsTab } =
			usePlayerConfiguration()
		const [isInteractingWithResources, setIsInteractingWithResources] =
			useState(false)
		const [currentActiveIndex, setCurrentActiveIndex] = useState<number>()

		const virtuoso = useRef<VirtuosoHandle>(null)
		const errorId = new URLSearchParams(location.search).get(
			PlayerSearchParameters.errorId,
		)
		const { setResourcePanel, setErrorPanel, panelIsOpen } =
			useResourceOrErrorDetailPanel()

		const {
			resources: parsedResources,
			loadResources,
			resourcesLoading: loading,
		} = useResourcesContext()
		useEffect(() => {
			loadResources()
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [])

		const networkRange = useMemo(() => {
			if (parsedResources.length > 0) {
				const start = parsedResources[0].startTime
				const end =
					parsedResources[parsedResources.length - 1].responseEnd
				return end - start
			}
			return 0
		}, [parsedResources])

		const resourcesToRender = useMemo(() => {
			const current =
				(parsedResources
					?.filter((r) => {
						if (requestType === RequestType.All) {
							return true
						} else if (requestType === r.initiatorType) {
							return true
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
		}, [requestType, filter, parsedResources, startTime])

		const currentResourceIdx = useMemo(() => {
			return findLastActiveEventIndex(
				Math.round(time - startTime),
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
						setResourcePanel(resource)
						setTime(resource.startTime)
						scrollFunction(resourcesToRender.indexOf(resource))
						message.success(
							`Changed player time to when error was thrown at ${MillisToMinutesAndSeconds(
								resource.startTime,
							)}.`,
						)
					} else {
						setSelectedDevToolsTab(DevToolTabType.Errors)
						setErrorPanel(matchingError)
						const startTime = sessionMetadata.startTime
						if (startTime && matchingError.timestamp) {
							const errorDateTime = new Date(
								matchingError.timestamp,
							)
							const deltaMilliseconds =
								errorDateTime.getTime() - startTime
							setTime(deltaMilliseconds)
							message.success(
								`Changed player time to when error was thrown at ${MillisToMinutesAndSeconds(
									deltaMilliseconds,
								)}.`,
							)
						}
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
			setErrorPanel,
			setResourcePanel,
			setSelectedDevToolsTab,
			setShowDevTools,
		])

		useEffect(() => {
			if (
				!isInteractingWithResources &&
				autoScroll &&
				state === ReplayerState.Playing
			) {
				scrollFunction(currentResourceIdx)
			}
			// want this to trigger on autoscroll change, not isInteractingWithMessages
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [currentResourceIdx, scrollFunction, autoScroll, state])

		useEffect(() => {
			// scroll network events on player timeline click
			if (state === ReplayerState.Paused) {
				scrollFunction(currentResourceIdx)
			}
		}, [currentResourceIdx, scrollFunction, state, time])

		// Sets up a keydown listener to allow the user to quickly view network requests details in the resource panel by using the up/down arrow key.
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
					if (panelIsOpen) {
						requestAnimationFrame(() => {
							setResourcePanel(resourcesToRender[nextIndex])
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
			panelIsOpen,
			resourcesToRender,
			setResourcePanel,
		])

		return (
			<Box className={clsx(styles.container, styles.containerPadding)}>
				{loading || !session ? (
					<Skeleton
						count={10}
						style={{ height: 25, marginBottom: 11 }}
					/>
				) : resourcesToRender.length > 0 ? (
					<Box className={styles.container}>
						<Box className={styles.networkHeader}>
							<Text color={'neutralN11'}>Status</Text>
							<Text color={'neutralN11'}>Type</Text>
							<Text color={'neutralN11'}>Name</Text>
							<Text color={'neutralN11'}>Time</Text>
							<Text color={'neutralN11'}>Waterfall</Text>
						</Box>
						<Box className={styles.networkBox}>
							<Virtuoso
								onMouseEnter={() => {
									setIsInteractingWithResources(true)
								}}
								onMouseLeave={() => {
									setIsInteractingWithResources(false)
								}}
								ref={virtuoso}
								overscan={1024}
								increaseViewportBy={1024}
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
											resource={resource}
											networkRange={networkRange}
											isCurrentResource={
												currentResourceIdx === index
											}
											searchTerm={filter}
											onClickHandler={() => {
												setCurrentActiveIndex(index)
												setResourcePanel(resource)
											}}
											playerStartTime={startTime}
											hasError={!!error}
											networkRequestAndResponseRecordingEnabled={
												session.enable_recording_network_contents ||
												false
											}
										/>
									)
								}}
							/>
						</Box>
					</Box>
				) : resourcesToRender.length === 0 &&
				  (filter !== '' || requestType !== RequestType.All) ? (
					<div className={styles.noDataContainer}>
						<p>
							{`No ${
								requestType !== RequestType.All
									? requestType
									: ''
							} network resources ${
								filter !== '' ? `matching ${filter}` : ''
							}`}
						</p>
					</div>
				) : (
					<div className={styles.noDataContainer}>
						<h3>
							There are no network recordings for this session.
						</h3>
						<p>
							If you expected to see data here, please make sure{' '}
							<code>networkRecording</code> is set to{' '}
							<code>true</code>. You can{' '}
							<a
								href="https://docs.highlight.run/api#w0-highlightoptions"
								target="_blank"
								rel="noreferrer"
							>
								learn more here
							</a>
							.
						</p>
					</div>
				)}
			</Box>
		)
	},
)

interface ResourceRowProps {
	resource: NetworkResource
	networkRange: number
	isCurrentResource: boolean
	searchTerm: string
	onClickHandler: () => void
	networkRequestAndResponseRecordingEnabled: boolean
	playerStartTime: number
	hasError?: boolean
}

const ResourceRow = ({
	resource,
	networkRange,
	isCurrentResource,
	searchTerm,
	onClickHandler,
	networkRequestAndResponseRecordingEnabled,
	playerStartTime,
	hasError,
}: ResourceRowProps) => {
	const { detailedPanel } = usePlayerUIContext()
	const leftPaddingPercent = (resource.startTime / networkRange) * 100
	const actualPercent = Math.max(
		((resource.responseEnd - resource.startTime) / networkRange) * 100,
		0.1,
	)
	const rightPaddingPercent = 100 - actualPercent - leftPaddingPercent

	return (
		<Box key={resource.id.toString()} onClick={onClickHandler}>
			<Box
				className={styles.networkRowVariants({
					current: isCurrentResource,
					failedResource: !!(
						hasError ||
						(resource.requestResponsePairs?.response.status &&
							(resource.requestResponsePairs.response.status ===
								0 ||
								resource.requestResponsePairs.response.status >=
									400))
					),
					showingDetails:
						detailedPanel?.id === resource.id.toString(),
				})}
			>
				<Box>
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
				</Box>
				<Box>
					{getNetworkResourcesDisplayName(resource.initiatorType)}
				</Box>
				<Tooltip title={resource.displayName || resource.name}>
					<TextHighlighter
						className={styles.nameSection}
						searchWords={[searchTerm]}
						autoEscape={true}
						textToHighlight={resource.displayName || resource.name}
					/>
				</Tooltip>
				<Box>
					{playerTimeToSessionAbsoluteTime({
						sessionStartTime: playerStartTime,
						relativeTime: resource.startTime,
					})}
				</Box>
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
							zIndex: 100,
						}}
					/>
					<Box
						style={{
							width: `${rightPaddingPercent}%`,
						}}
						className={styles.timingBarEmptySection}
					/>
				</Box>
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
