import { Box, Text } from '@highlight-run/ui/components'
import { getResponseStatusCode } from '@pages/Player/helpers'
import { useEffect } from 'react'

import { TableList, TableListItem } from '@/components/TableList/TableList'
import { ErrorObject } from '@/graph/generated/schemas'
import RequestMetrics from '@/pages/Player/Toolbar/DevToolsWindow/ResourcePage/components/RequestMetrics/RequestMetrics'
import { UnknownRequestStatusCode } from '@/pages/Player/Toolbar/DevToolsWindowV2/NetworkPage/NetworkPage'
import {
	formatSize,
	getNetworkResourcesDisplayName,
	NetworkResource,
} from '@/pages/Player/Toolbar/DevToolsWindowV2/utils'
import { REQUEST_INITIATOR_TYPES } from '@/pages/Player/utils/utils'
import { CodeBlock } from '@/pages/Setup/CodeBlock/CodeBlock'
import analytics from '@/util/analytics'
import { formatTime } from '@/util/time'

enum NetworkResourceMeta {
	General = 'General',
	RequestHeaders = 'Request Headers',
	RequestPayload = 'Request Payload',
	ResponseHeaders = 'Response Headers',
	ResponsePayload = 'Response Payload',
}

export const NetworkResourceInfo = ({
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

	const statusCode = getResponseStatusCode(selectedNetworkResource)

	useEffect(() => {
		analytics.track('session_network-resource-info_view', {
			type: selectedNetworkResource?.initiatorType,
		})
	}, [selectedNetworkResource?.initiatorType])

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
			valueDisplayValue:
				statusCode === 'Unknown' ? (
					<UnknownRequestStatusCode
						networkRequestAndResponseRecordingEnabled={
							networkRecordingEnabledForSession
						}
					/>
				) : (
					statusCode
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
		...(selectedNetworkResource?.initiatorType === 'websocket'
			? []
			: [
					{
						keyDisplayValue: 'Size',
						valueDisplayValue: selectedNetworkResource
							?.requestResponsePairs?.response.size ? (
							formatSize(
								selectedNetworkResource.requestResponsePairs
									.response.size,
							)
						) : selectedNetworkResource?.requestResponsePairs
								?.response.status === 0 ? (
							'-'
						) : selectedNetworkResource?.requestResponsePairs
								?.urlBlocked ||
						  selectedNetworkResource?.transferSize == null ? (
							'-'
						) : selectedNetworkResource?.transferSize === 0 ? (
							'Cached'
						) : (
							<>
								{formatSize(
									selectedNetworkResource.transferSize,
								)}
							</>
						),
					},
			  ]),
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

				if (Array.isArray(parsedRequestBody)) {
					requestPayloadData.push({
						keyDisplayValue: 'json',
						valueDisplayValue: parsedRequestBody,
					})
				} else {
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
				}
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
				if (Array.isArray(parsedResponseBody)) {
					responsePayloadData.push({
						keyDisplayValue: 'json',
						valueDisplayValue: parsedResponseBody,
					})
				} else {
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
				}
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

const NoRecordingMessage = () => {
	return (
		<Box width="full" display="flex" flexDirection="column" gap="12" pb="4">
			<Text size="small" color="moderate" weight="medium">
				Network recording is on, but no data was recorded.
			</Text>
		</Box>
	)
}

const NetworkRecordingEducationMessage = () => {
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
