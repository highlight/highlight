import Input from '@components/Input/Input'
import { ErrorObject } from '@graph/schemas'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import {
	NetworkResourceWithID,
	useResourcesContext,
} from '@pages/Player/ResourcesContext/ResourcesContext'
import { DevToolTabType } from '@pages/Player/Toolbar/DevToolsContext/DevToolsContext'
import { useResourceOrErrorDetailPanel } from '@pages/Player/Toolbar/DevToolsWindow/ResourceOrErrorDetailPanel/ResourceOrErrorDetailPanel'
import useLocalStorage from '@rehooks/local-storage'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import { message } from 'antd'
import classNames from 'classnames'
import { H } from 'highlight.run'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import TextHighlighter from '../../../../../components/TextHighlighter/TextHighlighter'
import Tooltip from '../../../../../components/Tooltip/Tooltip'
import { ReplayerState, useReplayerContext } from '../../../ReplayerContext'
import devStyles from '../DevToolsWindow.module.scss'
import { getNetworkResourcesDisplayName, Option } from '../Option/Option'
import styles from './ResourcePage.module.scss'

export const ResourcePage = React.memo(
	({ time, startTime }: { time: number; startTime: number }) => {
		const {
			pause,
			state,
			session,
			isPlayerReady,
			errors,
			replayer,
			setTime,
			sessionMetadata,
		} = useReplayerContext()
		const { setShowDevTools, setSelectedDevToolsTab } =
			usePlayerConfiguration()
		const [options, setOptions] = useState<Array<string>>([])
		const [currentOption, setCurrentOption] = useLocalStorage(
			'tabs-DevTools-ResourcePage-active-tab',
			'All',
		)
		const [filterSearchTerm, setFilterSearchTerm] = useState('')
		const [currentResource, setCurrentResource] = useState(0)
		const [networkRange, setNetworkRange] = useState(0)
		const [isInteractingWithResources, setIsInteractingWithResources] =
			useState(false)
		const [currentActiveIndex, setCurrentActiveIndex] = useState<number>()
		const [allResources, setAllResources] = useState<
			Array<NetworkResource> | undefined
		>([])

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
		loadResources()

		useEffect(() => {
			const optionSet = new Set<string>()
			parsedResources?.forEach((r) => {
				if (!optionSet.has(r.initiatorType)) {
					optionSet.add(r.initiatorType)
				}
			})
			setOptions(['All', ...Array.from(optionSet)])
		}, [parsedResources])

		useEffect(() => {
			if (parsedResources) {
				setAllResources(
					// @ts-expect-error
					parsedResources?.filter((r) => {
						if (currentOption === 'All') {
							return true
						} else if (currentOption === r.initiatorType) {
							return true
						}
						return false
					}) ?? [],
				)
			}
		}, [parsedResources, currentOption, options])

		useEffect(() => {
			if (parsedResources.length > 0) {
				const start = parsedResources[0].startTime
				const end =
					parsedResources[parsedResources.length - 1].responseEnd
				setNetworkRange(end - start)
			}
		}, [parsedResources])

		const resourcesToRender = useMemo(() => {
			if (!allResources) {
				return []
			}

			if (filterSearchTerm !== '') {
				return allResources.filter((resource) => {
					if (!resource.name) {
						return false
					}

					return (resource.displayName || resource.name)
						.toLocaleLowerCase()
						.includes(filterSearchTerm.toLocaleLowerCase())
				})
			}

			return allResources
		}, [allResources, filterSearchTerm])

		useEffect(() => {
			if (resourcesToRender?.length) {
				let msgIndex = 0
				const relativeTime = time - startTime
				let msgDiff: number = Math.abs(
					relativeTime - resourcesToRender[0].startTime,
				)
				for (let i = 0; i < resourcesToRender.length; i++) {
					const currentDiff: number = Math.abs(
						relativeTime - resourcesToRender[i].startTime,
					)
					if (currentDiff < msgDiff) {
						msgIndex = i
						msgDiff = currentDiff
					}
				}
				if (currentResource !== msgIndex) {
					setCurrentResource(msgIndex)
				}
			}
		}, [resourcesToRender, startTime, time, currentResource])

		// eslint-disable-next-line react-hooks/exhaustive-deps
		const scrollFunction = useCallback(
			_.debounce((index: number) => {
				if (virtuoso.current) {
					virtuoso.current.scrollToIndex({
						index,
						align: 'center',
						behavior: 'smooth',
					})
				}
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
						H.track(
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
				state === ReplayerState.Playing
			) {
				scrollFunction(currentResource)
			}
		}, [currentResource, scrollFunction, isInteractingWithResources, state])

		useEffect(() => {
			// scroll network events on player timeline click
			if (state === ReplayerState.Paused) {
				scrollFunction(currentResource)
			}
		}, [currentResource, scrollFunction, state, time])

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
						setResourcePanel(resourcesToRender[nextIndex])
						virtuoso.current?.scrollToIndex(nextIndex - 1)
					}
				}
			}
			document.addEventListener('keydown', listener)

			return () => {
				document.removeEventListener('keydown', listener)
			}
		}, [
			currentActiveIndex,
			panelIsOpen,
			resourcesToRender,
			resourcesToRender.length,
			setResourcePanel,
		])

		// eslint-disable-next-line react-hooks/exhaustive-deps
		const pauseFunction = useCallback(
			_.debounce((t: number) => {
				pause(t)
			}, 300),
			[],
		)

		useEffect(() => {
			if (
				resourcesToRender?.length &&
				currentActiveIndex !== undefined &&
				state == ReplayerState.Paused
			) {
				pauseFunction(resourcesToRender[currentActiveIndex]?.startTime)
			}
			// don't want state changes to move the player
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [pauseFunction, resourcesToRender, currentActiveIndex])

		return (
			<div className={styles.resourcePageWrapper}>
				<div className={devStyles.topBar}>
					<div className={styles.optionsWrapper}>
						<div className={styles.optionsContainer}>
							{options.map((o: string, i: number) => {
								return (
									<Option
										key={i.toString()}
										onSelect={() => setCurrentOption(o)}
										selected={o === currentOption}
										optionValue={o}
									/>
								)
							})}
						</div>
						<div className={styles.filterContainer}>
							<Input
								allowClear
								placeholder="Filter"
								value={filterSearchTerm}
								onChange={(event) => {
									setFilterSearchTerm(event.target.value)
								}}
								size="small"
								disabled={loading}
							/>
						</div>
					</div>
				</div>
				<div className={styles.networkTableWrapper}>
					{loading || !session ? (
						<div className={devStyles.skeletonWrapper}>
							<Skeleton
								count={2}
								style={{ height: 25, marginBottom: 11 }}
							/>
						</div>
					) : (
						<>
							<div className={styles.networkTopBar}>
								<div className={styles.networkColumn}>
									Status
								</div>
								<div className={styles.networkColumn}>Type</div>
								<div className={styles.networkColumn}>Name</div>
								<div className={styles.networkColumn}>Time</div>
								<div
									className={classNames(
										styles.networkColumn,
										styles.waterfall,
									)}
								>
									Waterfall
								</div>
							</div>
							<div
								id="networkStreamWrapper"
								className={styles.networkStreamWrapper}
							>
								{resourcesToRender.length > 0 && session ? (
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
										className={styles.virtuoso}
										itemContent={(index, resource) => {
											const requestId =
												getHighlightRequestId(resource)
											const error = errors.find(
												(e) =>
													e.request_id === requestId,
											)
											return (
												<div style={{ height: 36 }}>
													<ResourceRow
														key={index.toString()}
														resource={resource}
														networkRange={
															networkRange
														}
														currentResource={
															currentResource
														}
														searchTerm={
															filterSearchTerm
														}
														onClickHandler={() => {
															setCurrentActiveIndex(
																index,
															)
															setResourcePanel(
																resource,
															)
														}}
														playerStartTime={
															startTime
														}
														playerRelTime={
															time - startTime
														}
														hasError={!!error}
														networkRequestAndResponseRecordingEnabled={
															session.enable_recording_network_contents ||
															false
														}
													/>
												</div>
											)
										}}
									/>
								) : resourcesToRender.length === 0 &&
								  filterSearchTerm !== '' ? (
									<div className={styles.noDataContainer}>
										<p>
											No network resources matching '
											{filterSearchTerm}'
										</p>
									</div>
								) : (
									<div className={styles.noDataContainer}>
										<h3>
											There are no network recordings for
											this session.
										</h3>
										<p>
											If you expected to see data here,
											please make sure{' '}
											<code>networkRecording</code> is set
											to <code>true</code>. You can{' '}
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
							</div>
						</>
					)}
				</div>
			</div>
		)
	},
)

export type NetworkResource = NetworkResourceWithID & {
	requestResponsePairs?: RequestResponsePair
	errors?: ErrorObject[]
	offsetStartTime?: number
}

interface ResourceRowProps {
	resource: NetworkResource
	networkRange: number
	currentResource: number
	searchTerm: string
	onClickHandler: () => void
	networkRequestAndResponseRecordingEnabled: boolean
	playerStartTime: number
	playerRelTime: number
	hasError?: boolean
}

const ResourceRow = ({
	resource,
	networkRange,
	currentResource,
	searchTerm,
	onClickHandler,
	networkRequestAndResponseRecordingEnabled,
	playerStartTime,
	playerRelTime,
	hasError,
}: ResourceRowProps) => {
	const ActiveNetworkRequestRangeMillis = 1000
	const { detailedPanel } = usePlayerUIContext()
	const leftPaddingPercent = (resource.startTime / networkRange) * 100
	const actualPercent = Math.max(
		((resource.responseEnd - resource.startTime) / networkRange) * 100,
		0.1,
	)
	const rightPaddingPercent = 100 - actualPercent - leftPaddingPercent
	const isCurrentResource =
		resource.id === currentResource ||
		(resource?.responseEnd
			? playerRelTime >= resource.startTime &&
			  playerRelTime <= resource.responseEnd
			: playerRelTime >= resource.startTime &&
			  playerRelTime <=
					resource.startTime + ActiveNetworkRequestRangeMillis)

	return (
		<div key={resource.id.toString()} onClick={onClickHandler}>
			<div
				className={classNames(styles.networkRow, {
					[styles.current]: isCurrentResource,
					[styles.failedResource]:
						hasError ||
						(resource.requestResponsePairs?.response.status &&
							(resource.requestResponsePairs.response.status ===
								0 ||
								resource.requestResponsePairs.response.status >=
									400)),
					[styles.showingDetails]:
						detailedPanel?.id === resource.id.toString(),
				})}
			>
				{isCurrentResource && (
					<div className={styles.currentIndicator} />
				)}
				<div className={styles.typeSection}>
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
				</div>
				<div className={styles.typeSection}>
					{getNetworkResourcesDisplayName(resource.initiatorType)}
				</div>
				<Tooltip title={resource.displayName || resource.name}>
					<TextHighlighter
						className={styles.nameSection}
						searchWords={[searchTerm]}
						autoEscape={true}
						textToHighlight={resource.displayName || resource.name}
					/>
				</Tooltip>
				<div className={styles.typeSection}>
					{playerTimeToSessionAbsoluteTime({
						sessionStartTime: playerStartTime,
						relativeTime: resource.startTime,
					})}
				</div>
				<div className={styles.timingBarWrapper}>
					<div
						style={{
							width: `${leftPaddingPercent}%`,
						}}
						className={styles.timingBarEmptySection}
					/>
					<div
						className={styles.timingBar}
						style={{
							width: `${actualPercent}%`,
							zIndex: 100,
						}}
					/>
					<div
						style={{
							width: `${rightPaddingPercent}%`,
						}}
						className={styles.timingBarEmptySection}
					/>
				</div>
			</div>
		</div>
	)
}

interface Request {
	url: string
	verb: string
	headers: Headers
	body: any
}

interface Response {
	status: number
	headers: any
	body: any
	/** Number of Bytes transferred over the network. */
	size?: number
}

interface RequestResponsePair {
	request: Request
	response: Response
	/** Whether this URL matched a `urlToBlock` so the contents should not be recorded. */
	urlBlocked: boolean
}

/**
 * Formats bytes to the short form of KB and MB.
 */
export const formatSize = (bytes: number) => {
	if (bytes < 1024) {
		return `${roundOff(bytes)} B`
	}
	if (bytes < 1024 ** 2) {
		return `${roundOff(bytes / 1024)} KB`
	}
	return `${roundOff(bytes / 1024 ** 2)} MB`
}

const roundOff = (value: number, decimal = 1) => {
	const base = 10 ** decimal
	return Math.round(value * base) / base
}

export const findResourceWithMatchingHighlightHeader = (
	headerValue: string,
	resources: NetworkResource[],
) => {
	return resources.find(
		(resource) => getHighlightRequestId(resource) === headerValue,
	)
}

export const getHighlightRequestId = (resource: NetworkResource) => {
	return resource.requestResponsePairs?.request?.id
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
