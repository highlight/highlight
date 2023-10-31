import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import {
	Ariakit,
	Badge,
	Box,
	ButtonIcon,
	Heading,
	IconSolidArrowCircleRight,
	IconSolidX,
	sprinkles,
	Tabs,
	Tag,
	Text,
} from '@highlight-run/ui'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { useResourcesContext } from '@pages/Player/ResourcesContext/ResourcesContext'
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import analytics from '@util/analytics'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useActiveNetworkResourceId } from '@/hooks/useActiveNetworkResourceId'
import { useProjectId } from '@/hooks/useProjectId'
import { NetworkResourceErrors } from '@/pages/Player/RightPlayerPanel/components/NetworkResourcePanel/NetworkResourceErrors'
import { NetworkResourceInfo } from '@/pages/Player/RightPlayerPanel/components/NetworkResourcePanel/NetworkResourceInfo'
import { NetworkResourceLogs } from '@/pages/Player/RightPlayerPanel/components/NetworkResourcePanel/NetworkResourceLogs'
import { WebSocketMessages } from '@/pages/Player/RightPlayerPanel/components/WebSocketMessages/WebSocketMessages'
import { useWebSocket } from '@/pages/Player/WebSocketContext/WebSocketContext'
import { TraceFlameGraph } from '@/pages/Traces/TraceFlameGraph'
import { TraceProvider, useTrace } from '@/pages/Traces/TraceProvider'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'

import * as styles from './NetworkResourcePanel.css'

enum NetworkRequestTabs {
	Info = 'Info',
	Errors = 'Errors',
	Logs = 'Logs',
	Trace = 'Trace',
}

enum WebSocketTabs {
	Headers = 'Headers',
	Messages = 'Messages',
}

export const NetworkResourcePanel = () => {
	const { projectId } = useProjectId()
	const networkResourceDialog = Ariakit.useDialogStore()
	const networkResourceDialogState = networkResourceDialog.getState()
	const { activeNetworkResourceId, setActiveNetworkResourceId } =
		useActiveNetworkResourceId()

	const { resources } = useResourcesContext()
	const resourceIdx = resources.findIndex(
		(r) => activeNetworkResourceId === r.id,
	)
	const resource = resources[resourceIdx] as NetworkResource | undefined
	const traceId = useMemo(() => {
		return resource?.requestResponsePairs?.request?.id
	}, [resource?.requestResponsePairs?.request?.id])

	const hide = useCallback(() => {
		setActiveNetworkResourceId(undefined)
		networkResourceDialog.hide()
	}, [networkResourceDialog, setActiveNetworkResourceId])

	useHotkeys('Escape', hide, [])

	useEffect(() => {
		if (!resources?.length) {
			return
		}

		if (resource?.id !== undefined) {
			networkResourceDialog.show()
		} else {
			hide()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resource?.id])

	// Close the dialog and reset the active resource when the user interacts with
	// the page outside the dialog.
	const previousVisibleRef = React.useRef(networkResourceDialogState.open)
	useEffect(() => {
		if (
			previousVisibleRef.current !== networkResourceDialogState.open &&
			!networkResourceDialogState.open
		) {
			hide()
		}

		previousVisibleRef.current = networkResourceDialogState.open
	}, [hide, networkResourceDialogState.open])

	return (
		<Ariakit.Dialog
			store={networkResourceDialog}
			modal={false}
			autoFocusOnShow={false}
			className={sprinkles({
				backgroundColor: 'white',
				display: 'flex',
				flexDirection: 'column',
				border: 'dividerWeak',
				borderTopRightRadius: '6',
				borderBottomRightRadius: '6',
				boxShadow: 'small',
				overflow: 'hidden',
			})}
			style={{
				width: '45%',
				minWidth: 400,
				right: 8,
				top: 8,
				bottom: 8,
				zIndex: 8,
				position: 'absolute',
			}}
		>
			{resource &&
				(resource.initiatorType === 'websocket' ? (
					<WebSocketDetails resource={resource} hide={hide} />
				) : (
					<TraceProvider projectId={projectId} traceId={traceId!}>
						<NetworkResourceDetails
							resource={resource}
							hide={hide}
						/>
					</TraceProvider>
				))}
		</Ariakit.Dialog>
	)
}

function NetworkResourceDetails({
	resource,
	hide,
}: {
	resource: NetworkResource
	hide: () => void
}) {
	const initialized = useRef<boolean>(false)
	const { resources } = useResourcesContext()
	const { selectedSpan } = useTrace()
	const [activeTab, setActiveTab] = useState<NetworkRequestTabs>(
		NetworkRequestTabs.Info,
	)
	const {
		sessionMetadata: { startTime },
		setTime,
		session,
	} = useReplayerContext()
	const { activeNetworkResourceId, setActiveNetworkResourceId } =
		useActiveNetworkResourceId()

	const networkResources = useMemo(() => {
		return (
			(resources.map((event) => ({
				...event,
				timestamp: event.startTime,
			})) as NetworkResource[]) ?? []
		)
	}, [resources])

	const resourceIdx = resources.findIndex(
		(r) => activeNetworkResourceId === r.id,
	)

	const [prev, next] = [resourceIdx - 1, resourceIdx + 1]
	const canMoveBackward = !!resources[prev]
	const canMoveForward = !!resources[next]

	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const timestamp = useMemo(() => {
		return new Date(resource.startTime).getTime()
	}, [resource.startTime])

	useHotkeys(
		'h',
		() => {
			if (canMoveBackward) {
				analytics.track('PrevNetworkResourceKeyboardShortcut')
				setActiveNetworkResourceId(networkResources[prev].id)
			}
		},
		[canMoveBackward, prev],
	)

	useHotkeys(
		'l',
		() => {
			if (canMoveForward) {
				analytics.track('NextNetworkResourceKeyboardShortcut')
				setActiveNetworkResourceId(networkResources[next].id)
			}
		},
		[canMoveForward, next],
	)

	useEffect(() => {
		if (selectedSpan?.spanID && initialized.current) {
			setActiveTab(NetworkRequestTabs.Trace)
		}

		// Don't want to select the trace on the first render.
		initialized.current = true
	}, [selectedSpan?.spanID])

	useEffect(() => {
		setActiveTab(NetworkRequestTabs.Info)
		initialized.current = false
	}, [resource.id])

	return (
		<>
			<Box
				px="8"
				py="6"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				borderBottom="divider"
			>
				<Box display="flex" gap="6" alignItems="center">
					<PreviousNextGroup
						onPrev={() =>
							setActiveNetworkResourceId(
								networkResources[prev].id,
							)
						}
						canMoveBackward={canMoveBackward}
						prevShortcut="h"
						onNext={() =>
							setActiveNetworkResourceId(
								networkResources[next].id,
							)
						}
						canMoveForward={canMoveForward}
						nextShortcut="l"
						size="small"
					/>
					<Text size="xSmall" weight="medium" color="weak">
						{resourceIdx + 1} / {networkResources.length}
					</Text>
				</Box>
				<ButtonIcon
					kind="secondary"
					size="small"
					shape="square"
					emphasis="low"
					icon={<IconSolidX />}
					onClick={hide}
				/>
			</Box>
			<Box
				pt="16"
				px="12"
				pb="12"
				display="flex"
				flexDirection="column"
				gap="12"
			>
				<Heading level="h4">Network request</Heading>

				<Box display="flex" alignItems="center" gap="4">
					<Badge
						label={String(
							showPlayerAbsoluteTime
								? playerTimeToSessionAbsoluteTime({
										sessionStartTime: startTime,
										relativeTime: timestamp,
								  })
								: MillisToMinutesAndSeconds(timestamp),
						)}
						size="medium"
						shape="basic"
						variant="gray"
						flexShrink={0}
					/>
					<Tag
						shape="basic"
						kind="secondary"
						size="medium"
						emphasis="low"
						iconRight={<IconSolidArrowCircleRight />}
						onClick={() => {
							setTime(timestamp)
							hide()
						}}
					>
						Go to
					</Tag>
				</Box>

				<TraceFlameGraph />
			</Box>

			<Tabs<NetworkRequestTabs>
				tab={activeTab}
				setTab={(tab) => setActiveTab(tab)}
				pages={{
					[NetworkRequestTabs.Info]: {
						page: (
							<NetworkResourceInfo
								selectedNetworkResource={resource}
								networkRecordingEnabledForSession={
									session?.enable_recording_network_contents ||
									false
								}
							/>
						),
					},
					[NetworkRequestTabs.Errors]: {
						page: (
							<NetworkResourceErrors
								resource={resource}
								hide={hide}
							/>
						),
					},
					[NetworkRequestTabs.Logs]: {
						page: (
							<NetworkResourceLogs
								resource={resource}
								sessionStartTime={startTime}
							/>
						),
					},
					[NetworkRequestTabs.Trace]: {
						page: (
							<Box p="8">
								<TraceSpanAttributes span={selectedSpan!} />
							</Box>
						),
					},
				}}
				noHandle
				containerClass={styles.container}
				tabsContainerClass={styles.tabsContainer}
				pageContainerClass={styles.pageContainer}
			/>
		</>
	)
}

function WebSocketDetails({
	resource,
	hide,
}: {
	resource: NetworkResource
	hide: () => void
}) {
	const { resources } = useResourcesContext()
	const [activeTab, setActiveTab] = useState<WebSocketTabs>(
		WebSocketTabs.Headers,
	)
	const {
		sessionMetadata: { startTime },
		setTime,
		session,
	} = useReplayerContext()
	const { activeNetworkResourceId, setActiveNetworkResourceId } =
		useActiveNetworkResourceId()

	const networkResources = useMemo(() => {
		return (
			(resources.map((event) => ({
				...event,
				timestamp: event.startTime,
			})) as NetworkResource[]) ?? []
		)
	}, [resources])

	const resourceIdx = resources.findIndex(
		(r) => activeNetworkResourceId === r.id,
	)

	const [prev, next] = [resourceIdx - 1, resourceIdx + 1]
	const canMoveBackward = !!resources[prev]
	const canMoveForward = !!resources[next]

	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const timestamp = useMemo(() => {
		return new Date(resource.startTime).getTime()
	}, [resource.startTime])

	const { webSocketEvents, webSocketLoading } = useWebSocket(session)

	const webSocketEventsMap = useMemo(() => {
		const eventsMap: { [k: string]: any[] } = {}
		webSocketEvents.forEach((e) => {
			eventsMap[e.socketId] = []
		})
		webSocketEvents.forEach((e) => {
			eventsMap[e.socketId].push(e)
		})
		return eventsMap
	}, [webSocketEvents])

	const selectedWebSocketEvents = useMemo(() => {
		if (
			resource.socketId &&
			webSocketEventsMap.hasOwnProperty(resource.socketId)
		) {
			return [resource, ...webSocketEventsMap[resource.socketId]]
		} else {
			return []
		}
	}, [resource, webSocketEventsMap])

	useHotkeys(
		'h',
		() => {
			if (canMoveBackward) {
				analytics.track('PrevNetworkResourceKeyboardShortcut')
				setActiveNetworkResourceId(networkResources[prev].id)
			}
		},
		[canMoveBackward, prev],
	)

	useHotkeys(
		'l',
		() => {
			if (canMoveForward) {
				analytics.track('NextNetworkResourceKeyboardShortcut')
				setActiveNetworkResourceId(networkResources[next].id)
			}
		},
		[canMoveForward, next],
	)

	return (
		<>
			<Box
				pl="12"
				pr="8"
				py="6"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				borderBottom="divider"
			>
				<Box display="flex" gap="6" alignItems="center">
					<PreviousNextGroup
						onPrev={() =>
							setActiveNetworkResourceId(
								networkResources[prev].id,
							)
						}
						canMoveBackward={canMoveBackward}
						prevShortcut="h"
						onNext={() =>
							setActiveNetworkResourceId(
								networkResources[next].id,
							)
						}
						canMoveForward={canMoveForward}
						nextShortcut="l"
						size="small"
					/>
					<Text size="xSmall" weight="medium" color="weak">
						{resourceIdx + 1} / {networkResources.length}
					</Text>
				</Box>
				<ButtonIcon
					kind="secondary"
					size="small"
					shape="square"
					emphasis="low"
					icon={<IconSolidX />}
					onClick={hide}
				/>
			</Box>
			<Box px="12" py="8" display="flex" flexDirection="column" gap="8">
				<Heading level="h4">
					{resource.initiatorType === 'websocket'
						? resource.name
						: `WebSocket`}
				</Heading>

				<Box display="flex" alignItems="center" gap="4">
					<Badge
						label={String(
							showPlayerAbsoluteTime
								? playerTimeToSessionAbsoluteTime({
										sessionStartTime: startTime,
										relativeTime: timestamp,
								  })
								: MillisToMinutesAndSeconds(timestamp),
						)}
						size="medium"
						shape="basic"
						variant="gray"
						flexShrink={0}
					/>
					<Tag
						shape="basic"
						kind="secondary"
						size="medium"
						emphasis="low"
						iconRight={<IconSolidArrowCircleRight />}
						onClick={() => {
							setTime(timestamp)
						}}
					>
						Go to
					</Tag>
				</Box>
			</Box>

			<Tabs<WebSocketTabs>
				tab={activeTab}
				setTab={(tab) => setActiveTab(tab)}
				pages={{
					[WebSocketTabs.Headers]: {
						page: (
							<NetworkResourceInfo
								selectedNetworkResource={resource}
								networkRecordingEnabledForSession={
									session?.enable_recording_network_contents ||
									false
								}
							/>
						),
					},
					[WebSocketTabs.Messages]: {
						page: (
							<WebSocketMessages
								startEvent={resource}
								eventsLoading={webSocketLoading}
								events={selectedWebSocketEvents}
							/>
						),
					},
				}}
				noHandle
				tabsContainerClass={styles.tabsContainer}
				pageContainerClass={styles.pageContainer}
			/>
		</>
	)
}
