import CollapsibleSection from '@components/CollapsibleSection'
import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import { TableList, TableListItem } from '@components/TableList/TableList'
import { ErrorObject } from '@graph/schemas'
import {
	Badge,
	Box,
	ButtonIcon,
	IconSolidArrowCircleRight,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	IconSolidX,
	Tag,
	Text,
} from '@highlight-run/ui'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { useResourcesContext } from '@pages/Player/ResourcesContext/ResourcesContext'
import RequestMetrics from '@pages/Player/Toolbar/DevToolsWindow/ResourcePage/components/RequestMetrics/RequestMetrics'
import { UnknownRequestStatusCode } from '@pages/Player/Toolbar/DevToolsWindowV2/NetworkPage/NetworkPage'
import {
	formatSize,
	getNetworkResourcesDisplayName,
	NetworkResource,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { REQUEST_INITIATOR_TYPES } from '@pages/Player/utils/utils'
import { CodeBlock } from '@pages/Setup/CodeBlock/CodeBlock'
import analytics from '@util/analytics'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { formatTime, MillisToMinutesAndSeconds } from '@util/time'
import React, { useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

const NetworkResourceDetails = React.memo(
	({ resource }: { resource: NetworkResource }) => {
		const { setActiveNetworkResource } = usePlayerUIContext()
		const { resources } = useResourcesContext()
		const {
			sessionMetadata: { startTime },
			setTime,
			session,
		} = useReplayerContext()

		const networkResources = useMemo(() => {
			return (
				(resources.map((event) => ({
					...event,
					timestamp: event.startTime,
				})) as NetworkResource[]) ?? []
			)
		}, [resources])

		const resourceIdx = resources.findIndex((r) => resource.id === r.id)
		const [prev, next] = [resourceIdx - 1, resourceIdx + 1]
		const canMoveBackward = !!resources[prev]
		const canMoveForward = !!resources[next]

		const { showPlayerAbsoluteTime } = usePlayerConfiguration()
		const timestamp = useMemo(() => {
			return new Date(resource.timestamp).getTime() - startTime
		}, [resource.timestamp, startTime])

		useHotkeys(
			'h',
			() => {
				if (canMoveBackward) {
					analytics.track('PrevNetworkResourceKeyboardShortcut')
					setActiveNetworkResource(networkResources[prev])
				}
			},
			[canMoveBackward, prev],
		)

		useHotkeys(
			'l',
			() => {
				if (canMoveForward) {
					analytics.track('NextNetworkResourceKeyboardShortcut')
					setActiveNetworkResource(networkResources[next])
				}
			},
			[canMoveForward, next],
		)

		return (
			<Box
				display="flex"
				flexDirection="column"
				overflowX="hidden"
				overflowY="auto"
			>
				<Box pl="12" pr="8" py="6" display="flex">
					<Box display="flex" gap="6" alignItems="center">
						<PreviousNextGroup
							onPrev={() =>
								setActiveNetworkResource(networkResources[prev])
							}
							canMoveBackward={canMoveBackward}
							prevShortcut="h"
							onNext={() =>
								setActiveNetworkResource(networkResources[next])
							}
							canMoveForward={canMoveForward}
							nextShortcut="l"
						/>
						<Text size="xSmall" weight="medium" color="weak">
							{resourceIdx + 1} / {networkResources.length}
						</Text>
					</Box>
					<Box ml="auto" display="flex" alignItems="center">
						<ButtonIcon
							kind="secondary"
							size="small"
							shape="square"
							emphasis="low"
							icon={<IconSolidX />}
							onClick={() => {
								setActiveNetworkResource(undefined)
							}}
						/>
					</Box>
				</Box>
				<Box
					px="12"
					py="8"
					display="flex"
					flexDirection="column"
					gap="8"
				>
					<Text
						size="small"
						weight="medium"
						color="strong"
						wrap="breakWord"
						lines="4"
					>
						{resource.displayName ?? resource.name}
					</Text>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
					>
						<Badge
							label={String(
								showPlayerAbsoluteTime
									? playerTimeToSessionAbsoluteTime({
											sessionStartTime: startTime,
											relativeTime: timestamp,
									  })
									: MillisToMinutesAndSeconds(timestamp),
							)}
							size="small"
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
								setTime(
									new Date(resource.timestamp).getTime() -
										startTime,
								)
							}}
							style={{
								marginLeft: 'auto',
								flexShrink: 0,
							}}
						>
							Go to request
						</Tag>
					</Box>
				</Box>
				<NetworkResourceData
					selectedNetworkResource={resource}
					networkRecordingEnabledForSession={
						session?.enable_recording_network_contents || false
					}
				/>
			</Box>
		)
	},
)

export default NetworkResourceDetails

enum NetworkResourceMeta {
	General = 'General',
	RequestHeaders = 'Request Headers',
	RequestPayload = 'Request Payload',
	ResponseHeaders = 'Response Headers',
	ResponsePayload = 'Response Payload',
}

const NetworkResourceData = ({
	selectedNetworkResource,
	networkRecordingEnabledForSession,
}: {
	selectedNetworkResource?: NetworkResource
	networkRecordingEnabledForSession: boolean
}) => {
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

	const [expanded, setExpanded] = useState<NetworkResourceMeta | undefined>(
		NetworkResourceMeta.General,
	)

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
		<>
			{showRequestMetrics && (
				<RequestMetrics resource={selectedNetworkResource} />
			)}

			{sections.map(([key, value]) => {
				const isExpanded = expanded === key
				const title = (
					<Box
						py="8"
						px="12"
						bb={isExpanded ? undefined : 'secondary'}
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Text
							color="secondaryContentOnEnabled"
							as="span"
							size="small"
							weight="medium"
						>
							{key}
						</Text>

						<Box display="flex" gap="4" alignItems="center">
							<ButtonIcon
								icon={
									isExpanded ? (
										<IconSolidCheveronUp size={12} />
									) : (
										<IconSolidCheveronDown size={12} />
									)
								}
								kind="secondary"
								size="minimal"
								emphasis="low"
							/>
						</Box>
					</Box>
				)
				return (
					<CollapsibleSection
						key={key}
						title={title}
						expanded={isExpanded}
						setExpanded={(e) => {
							if (e) {
								setExpanded(key as NetworkResourceMeta)
							} else {
								setExpanded(undefined)
							}
						}}
					>
						<Box
							px="12"
							display="flex"
							justifyContent="space-between"
							alignItems="center"
						>
							<TableList
								data={value}
								noDataMessage={
									<NetworkRecordingEducationMessage />
								}
							/>
						</Box>
					</CollapsibleSection>
				)
			})}
		</>
	)
}

const NetworkRecordingEducationMessage = () => (
	<Box width="full" display="flex" flexDirection="column" gap="12" pb="4">
		<Text size="small" color="moderate" weight="medium">
			<code>recordHeadersAndBody</code> is disabled. If you would like to
			see XHR/Fetch headers and bodies you will need to enable{' '}
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
