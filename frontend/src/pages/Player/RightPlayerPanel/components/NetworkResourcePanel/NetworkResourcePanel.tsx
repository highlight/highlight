import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import { TableList, TableListItem } from '@components/TableList/TableList'
import { ErrorObject } from '@graph/schemas'
import {
	Ariakit,
	Badge,
	Box,
	ButtonIcon,
	Callout,
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
import RequestMetrics from '@pages/Player/Toolbar/DevToolsWindow/ResourcePage/components/RequestMetrics/RequestMetrics'
import { UnknownRequestStatusCode } from '@pages/Player/Toolbar/DevToolsWindowV2/NetworkPage/NetworkPage'
import {
	formatSize,
	getHighlightRequestId,
	getNetworkResourcesDisplayName,
	NetworkResource,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { REQUEST_INITIATOR_TYPES } from '@pages/Player/utils/utils'
import { CodeBlock } from '@pages/Setup/CodeBlock/CodeBlock'
import analytics from '@util/analytics'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { formatTime, MillisToMinutesAndSeconds } from '@util/time'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import LoadingBox from '@/components/LoadingBox'
import { useGetErrorGroupsOpenSearchQuery } from '@/graph/generated/hooks'
import { useActiveNetworkResourceId } from '@/hooks/useActiveNetworkResourceId'
import { useProjectId } from '@/hooks/useProjectId'
import { ErrorFeedCard } from '@/pages/ErrorsV2/ErrorFeedCard/ErrorFeedCard'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@/pages/Player/context/PlayerUIContext'

import * as styles from './NetworkResourcePanel.css'

enum NetworkRequestTabs {
	Info = 'Info',
	Errors = 'Errors',
	// This tab will be built out in a future PR.
	// Logs = 'Logs',
}

export const NetworkResourcePanel = () => {
	const networkResourceDialog = Ariakit.useDialogState()
	const { activeNetworkResourceId, setActiveNetworkResourceId } =
		useActiveNetworkResourceId()

	const { resources } = useResourcesContext()
	const resourceIdx = resources.findIndex(
		(r) => activeNetworkResourceId === r.id,
	)
	const resource = resources[resourceIdx] as NetworkResource | undefined

	const hide = useCallback(() => {
		setActiveNetworkResourceId(undefined)
		networkResourceDialog.hide()
	}, [networkResourceDialog, setActiveNetworkResourceId])

	useHotkeys('Escape', hide, [])

	useEffect(() => {
		if (resource?.id !== undefined) {
			networkResourceDialog.show()
		} else {
			hide()
		}
	}, [hide, networkResourceDialog, resource?.id])

	// Close the dialog and reset the active resource when the user interacts with
	// the page outside the dialog.
	const previousVisibleRef = React.useRef(networkResourceDialog.open)
	useEffect(() => {
		if (
			previousVisibleRef.current !== networkResourceDialog.open &&
			!networkResourceDialog.open
		) {
			hide()
		}

		previousVisibleRef.current = networkResourceDialog.open
	}, [hide, networkResourceDialog.open])

	return (
		<Ariakit.Dialog
			state={networkResourceDialog}
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
			{resource && (
				<NetworkResourceDetails resource={resource} hide={hide} />
			)}
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
	const { resources } = useResourcesContext()
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
			</Box>

			<Tabs<NetworkRequestTabs>
				tab={activeTab}
				setTab={(tab) => setActiveTab(tab)}
				pages={{
					[NetworkRequestTabs.Info]: {
						page: (
							<NetworkResourceData
								selectedNetworkResource={resource}
								networkRecordingEnabledForSession={
									session?.enable_recording_network_contents ||
									false
								}
							/>
						),
					},
					[NetworkRequestTabs.Errors]: {
						page: <ErrorsData resource={resource} hide={hide} />,
					},
					// [NetworkRequestTabs.Logs]: {
					// 	page: <Box>Logs</Box>,
					// },
				}}
				noHandle
				containerClass={styles.container}
				tabsContainerClass={styles.tabsContainer}
				pageContainerClass={styles.pageContainer}
			/>
		</>
	)
}

enum NetworkResourceMeta {
	General = 'General',
	RequestHeaders = 'Request Headers',
	RequestPayload = 'Request Payload',
	ResponseHeaders = 'Response Headers',
	ResponsePayload = 'Response Payload',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function NetworkResourceData({
	selectedNetworkResource,
	networkRecordingEnabledForSession,
}: {
	selectedNetworkResource?: NetworkResource
	networkRecordingEnabledForSession: boolean
}) {
	const requestHeadersData: TableListItem[] = []
	const requestPayloadData: TableListItem[] = []
	const responseHeadersData: TableListItem[] = []
	const responsePayloadData: TableListItem[] = []

	const generalData: TableListItem[] = [
		{
			keyDisplayValue: 'Request URL',
			valueDisplayValue: selectedNetworkResource?.name ?? 'Unknown',
		},
		{
			keyDisplayValue: 'Method',
			valueDisplayValue:
				selectedNetworkResource?.requestResponsePairs?.request.verb ||
				'GET',
		},
		{
			keyDisplayValue: 'Status',
			valueDisplayValue: selectedNetworkResource?.requestResponsePairs
				?.response.status ?? (
				<UnknownRequestStatusCode
					networkRequestAndResponseRecordingEnabled={
						networkRecordingEnabledForSession
					}
				/>
			),
			valueInfoTooltipMessage:
				selectedNetworkResource?.requestResponsePairs?.response
					.status === 0 &&
				'This request was blocked on the client. The usually reason is a browser extension (like an ad blocker) blocked the request.',
		},
		{
			keyDisplayValue: 'Time',
			valueDisplayValue:
				selectedNetworkResource?.responseEnd &&
				selectedNetworkResource?.startTime &&
				formatTime(
					selectedNetworkResource.responseEnd -
						selectedNetworkResource.startTime,
				),
		},
		{
			keyDisplayValue: 'Type',
			valueDisplayValue: getNetworkResourcesDisplayName(
				selectedNetworkResource?.initiatorType || '',
			),
		},
		{
			keyDisplayValue: 'Size',
			valueDisplayValue: selectedNetworkResource?.requestResponsePairs
				?.response.size ? (
				formatSize(
					selectedNetworkResource.requestResponsePairs.response.size,
				)
			) : selectedNetworkResource?.requestResponsePairs?.response
					.status === 0 ? (
				'-'
			) : selectedNetworkResource?.requestResponsePairs?.urlBlocked ||
			  selectedNetworkResource?.transferSize == null ? (
				'-'
			) : selectedNetworkResource?.transferSize === 0 ? (
				'Cached'
			) : (
				<>{formatSize(selectedNetworkResource.transferSize)}</>
			),
		},
	]

	const showRequestMetrics =
		selectedNetworkResource &&
		REQUEST_INITIATOR_TYPES.indexOf(
			selectedNetworkResource.initiatorType as typeof REQUEST_INITIATOR_TYPES[number],
		) > -1

	if (selectedNetworkResource?.requestResponsePairs) {
		const { request, response, urlBlocked } =
			selectedNetworkResource.requestResponsePairs

		if (urlBlocked) {
			generalData.push({
				keyDisplayValue: 'Recording Blocked',
				valueDisplayValue: (
					<>
						<span>
							The headers and body of this request was blocked.
							The URL matched one a URL that is known to contain
							secrets/passwords. You can{' '}
							<a
								href="https://docs.highlight.run/recording-network-requests-and-responses"
								target="_blank"
								rel="noreferrer"
							>
								learn more here.
							</a>
						</span>
					</>
				),
			})
		}

		if (request.headers) {
			const requestHeaderKeys = Object.keys(request.headers)

			requestHeaderKeys.forEach((key) => {
				requestHeadersData.push({
					keyDisplayValue: key,
					valueDisplayValue: request.headers[key],
				})
			})
		}

		if (request.body) {
			try {
				const parsedRequestBody = JSON.parse(request.body)

				Object.keys(parsedRequestBody).forEach((key) => {
					// `query` is a special for GraphQL requests.
					// Check to see if the value for `query` is valid GraphQL, if so render it using a GraphQL formatter
					if (key === 'query') {
						const queryString = parsedRequestBody[key]

						requestPayloadData.push({
							keyDisplayValue: key,
							valueDisplayValue: (
								<CodeBlock
									language="graphql"
									text={queryString}
									wrapLines
									wrapLongLines
									hideCopy
									customStyle={{
										fontSize: '10px',
									}}
								/>
							),
							data: queryString,
						})
					} else {
						const renderType =
							typeof parsedRequestBody[key] === 'object'
								? 'json'
								: 'string'
						requestPayloadData.push({
							keyDisplayValue: key,
							valueDisplayValue:
								renderType === 'string'
									? parsedRequestBody[key]?.toString()
									: JSON.parse(
											JSON.stringify(
												parsedRequestBody[key],
											),
									  ),
						})
					}
				})
			} catch {
				requestPayloadData.push({
					keyDisplayValue: 'body',
					valueDisplayValue: JSON.stringify(request.body),
				})
			}
		}

		if (response.headers) {
			Object.keys(response.headers).forEach((key) => {
				responseHeadersData.push({
					keyDisplayValue: key,
					valueDisplayValue: response.headers[key]?.toString(),
				})
			})
		}

		if (response.size) {
			responsePayloadData.push({
				keyDisplayValue: 'Size',
				valueDisplayValue: formatSize(response.size),
			})
		}

		if (response.body) {
			try {
				let parsedResponseBody: { [key: string]: any } = {}
				if (typeof response.body === 'object') {
					parsedResponseBody = JSON.parse(
						JSON.stringify(response.body),
					)
				} else {
					parsedResponseBody = JSON.parse(response.body)
				}
				Object.keys(parsedResponseBody).forEach((key) => {
					const renderType =
						typeof parsedResponseBody[key] === 'object'
							? 'json'
							: 'string'

					responsePayloadData.push({
						keyDisplayValue: key,
						valueDisplayValue:
							renderType === 'string'
								? parsedResponseBody[key]?.toString()
								: parsedResponseBody[key],
					})
				})
			} catch (e) {
				responsePayloadData.push({
					keyDisplayValue: '-',
					valueDisplayValue: JSON.stringify(response.body),
				})
			}
		}
	}

	const getErrorRows = (errorObj: ErrorObject): TableListItem[] => [
		{
			keyDisplayValue: 'Event',
			valueDisplayValue: errorObj.event.find((e) => e),
		},
		{
			keyDisplayValue: 'Stack Trace',
			valueDisplayValue: errorObj.stack_trace,
		},
	]

	const sections: [NetworkResourceMeta, TableListItem[]][] = [
		[NetworkResourceMeta.General, generalData],
	]

	if (selectedNetworkResource?.errors?.length) {
		selectedNetworkResource?.errors?.forEach((error, idx) => {
			sections.push([
				`Error ${idx + 1}` as NetworkResourceMeta,
				getErrorRows(error),
			])
		})
	}

	if (
		(selectedNetworkResource?.initiatorType === 'fetch' ||
			selectedNetworkResource?.initiatorType === 'xmlhttprequest') &&
		!selectedNetworkResource.requestResponsePairs?.urlBlocked
	) {
		Object.entries({
			[NetworkResourceMeta.RequestHeaders]: requestHeadersData,
			[NetworkResourceMeta.RequestPayload]: requestPayloadData,
			[NetworkResourceMeta.ResponseHeaders]: responseHeadersData,
			[NetworkResourceMeta.ResponsePayload]: responsePayloadData,
		}).forEach(([key, value]) =>
			sections.push([key as NetworkResourceMeta, value]),
		)
	}

	return (
		<Box>
			{showRequestMetrics && (
				<RequestMetrics resource={selectedNetworkResource} />
			)}

			{sections.map(([key, value]) => (
				<Box key={key} p="20">
					<Box
						pb="12"
						bb="secondary"
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Text size="large" weight="bold" color="strong">
							{key}
						</Text>
					</Box>

					<Box
						mt="12"
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<TableList
							data={value}
							noDataMessage={
								networkRecordingEnabledForSession ? (
									<NoRecordingMessage />
								) : (
									<NetworkRecordingEducationMessage />
								)
							}
						/>
					</Box>
				</Box>
			))}
		</Box>
	)
}

function NoRecordingMessage() {
	return (
		<Box width="full" display="flex" flexDirection="column" gap="12" pb="4">
			<Text size="small" color="moderate" weight="medium">
				Network recording is on, but no data was recorded.
			</Text>
		</Box>
	)
}

function NetworkRecordingEducationMessage() {
	return (
		<Box width="full" display="flex" flexDirection="column" gap="12" pb="4">
			<Text size="small" color="moderate" weight="medium">
				<code>recordHeadersAndBody</code> is disabled. If you would like
				to see XHR/Fetch headers and bodies you will need to enable{' '}
				<code>recordHeadersAndBody</code>.
			</Text>
			<Text size="small" color="moderate" weight="medium">
				You can learn more about this and about the security/privacy
				implications{' '}
				<a
					target="_blank"
					rel="noreferrer"
					href="https://docs.highlight.run/recording-network-requests-and-responses"
				>
					here
				</a>
				.
			</Text>
		</Box>
	)
}

const ErrorsData: React.FC<{ resource: NetworkResource; hide: () => void }> = ({
	resource,
	hide,
}) => {
	const { projectId } = useProjectId()
	const { errors: sessionErrors } = useReplayerContext()
	const requestId = getHighlightRequestId(resource)
	const errors = sessionErrors.filter((e) => e.request_id === requestId)
	const errorGroupSecureIds = errors.map((e) => e.error_group_secure_id)
	const { data, loading } = useGetErrorGroupsOpenSearchQuery({
		variables: {
			query: `{
				"bool": {
					"must": {
						"terms": {
							"secure_id.keyword": [${errorGroupSecureIds.map((id) => `"${id}"`).join(',')}]
						}
					}
				}
			}`.replace(/\s+/g, ''),
			project_id: projectId,
			count: errorGroupSecureIds.length,
		},
		skip: errors.length === 0,
	})

	const { setActiveError, setRightPanelView } = usePlayerUIContext()
	const { setShowRightPanel } = usePlayerConfiguration()

	return (
		<Box py="8" px="12">
			{data?.error_groups_opensearch.error_groups?.length ? (
				data?.error_groups_opensearch.error_groups.map(
					(errorGroup, idx) => (
						<ErrorFeedCard
							errorGroup={errorGroup}
							key={idx}
							onClick={() => {
								const error = errors.find(
									(e) =>
										e.error_group_secure_id ===
										errorGroup.secure_id,
								)
								setActiveError(error)
								setShowRightPanel(true)
								setRightPanelView(RightPanelView.Error)
								hide()
							}}
						/>
					),
				)
			) : loading ? (
				<LoadingBox />
			) : (
				<Callout title="No errors">
					<Box mb="6">
						<Text>
							There are no errors associated with this network
							request.
						</Text>
					</Box>
				</Callout>
			)}
		</Box>
	)
}
