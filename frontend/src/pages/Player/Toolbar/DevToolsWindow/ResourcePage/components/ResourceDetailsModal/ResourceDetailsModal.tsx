import { ErrorObject } from '@graph/schemas'
import { formatTime } from '@pages/Home/components/KeyPerformanceIndicators/utils/utils'
import RequestMetrics from '@pages/Player/Toolbar/DevToolsWindow/ResourcePage/components/RequestMetrics/RequestMetrics'
import { UnknownRequestStatusCode } from '@pages/Player/Toolbar/DevToolsWindowV2/NetworkPage/NetworkPage'
import { CodeBlock } from '@pages/Setup/CodeBlock/CodeBlock'
import React from 'react'

import DataCard from '../../../../../../../components/DataCard/DataCard'
import KeyValueTable, {
	KeyValueTableRow,
} from '../../../../../../../components/KeyValueTable/KeyValueTable'
import Space from '../../../../../../../components/Space/Space'
import { formatSize, NetworkResource } from '../../../../DevToolsWindowV2/utils'
import { getNetworkResourcesDisplayName } from '../../../Option/Option'
import styles from './ResourceDetailsModal.module.scss'

interface Props {
	selectedNetworkResource?: NetworkResource
	networkRecordingEnabledForSession: boolean
}

const TYPES_WITH_METRICS = ['xmlhttprequest', 'fetch']

const ResourceDetailsModal = ({
	selectedNetworkResource,
	networkRecordingEnabledForSession,
}: Props) => {
	const generalData: KeyValueTableRow[] = [
		{
			keyDisplayValue: 'Request URL',
			valueDisplayValue: selectedNetworkResource?.name || 'Unknown',
			renderType: 'string',
		},
		{
			keyDisplayValue: 'Method',
			valueDisplayValue:
				selectedNetworkResource?.requestResponsePairs?.request.verb ||
				'GET',
			renderType: 'string',
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
			renderType: 'string',
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
			renderType: 'string',
		},
		{
			keyDisplayValue: 'Type',
			valueDisplayValue: getNetworkResourcesDisplayName(
				selectedNetworkResource?.initiatorType || '',
			),
			renderType: 'string',
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
			renderType: 'string',
		},
	]

	const showRequestMetrics =
		selectedNetworkResource &&
		TYPES_WITH_METRICS.indexOf(selectedNetworkResource.initiatorType) > -1

	const requestHeadersData: KeyValueTableRow[] = []
	const requestPayloadData: KeyValueTableRow[] = []
	const responseHeadersData: KeyValueTableRow[] = []
	const responsePayloadData: KeyValueTableRow[] = []

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
				renderType: 'string',
			})
		}

		if (request.headers) {
			const requestHeaderKeys = Object.keys(request.headers)

			requestHeaderKeys.forEach((key) => {
				requestHeadersData.push({
					keyDisplayValue: key,
					valueDisplayValue: request.headers[key],
					renderType: 'string',
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
								/>
							),
							renderType: 'string',
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
							renderType,
						})
					}
				})
			} catch {
				requestPayloadData.push({
					keyDisplayValue: 'body',
					valueDisplayValue: request.body,
					renderType: 'string',
				})
			}
		}

		if (response.headers) {
			Object.keys(response.headers).forEach((key) => {
				responseHeadersData.push({
					keyDisplayValue: key,
					valueDisplayValue: response.headers[key]?.toString(),
					renderType: 'string',
				})
			})
		}

		if (response.size) {
			responsePayloadData.push({
				keyDisplayValue: 'Size',
				valueDisplayValue: formatSize(response.size),
				renderType: 'string',
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
						renderType,
					})
				})
			} catch (e) {
				responsePayloadData.push({
					keyDisplayValue: '-',
					valueDisplayValue: JSON.stringify(response.body),
					renderType: 'string',
				})
			}
		}
	}

	const getErrorRows = (errorObj: ErrorObject): KeyValueTableRow[] => [
		{
			keyDisplayValue: 'Event',
			valueDisplayValue: errorObj.event.find((e) => e),
			renderType: 'string',
		},
		{
			keyDisplayValue: 'Stack Trace',
			valueDisplayValue: errorObj.stack_trace,
			renderType: 'string',
		},
	]

	return (
		<section className={styles.modalContentContainer}>
			<Space size="large" direction="vertical">
				{showRequestMetrics && (
					<RequestMetrics resource={selectedNetworkResource} />
				)}

				<DataCard title="General" fullWidth>
					<KeyValueTable data={generalData} />
				</DataCard>

				{selectedNetworkResource?.errors?.map((error) => (
					<DataCard key={error.id} title="Backend Error" fullWidth>
						<KeyValueTable data={getErrorRows(error)} />
					</DataCard>
				))}

				{(selectedNetworkResource?.initiatorType === 'fetch' ||
					selectedNetworkResource?.initiatorType ===
						'xmlhttprequest') &&
					!selectedNetworkResource.requestResponsePairs
						?.urlBlocked && (
						<>
							<DataCard title="Request Headers" fullWidth>
								<KeyValueTable
									data={requestHeadersData}
									noDataMessage={
										!networkRecordingEnabledForSession ? (
											<NetworkRecordingEducationMessage />
										) : undefined
									}
								/>
							</DataCard>

							<DataCard title="Request Payload" fullWidth>
								<KeyValueTable
									data={requestPayloadData}
									noDataMessage={
										!networkRecordingEnabledForSession ? (
											<NetworkRecordingEducationMessage />
										) : undefined
									}
								/>
							</DataCard>

							<DataCard title="Response Headers" fullWidth>
								<KeyValueTable
									data={responseHeadersData}
									noDataMessage={
										!networkRecordingEnabledForSession ? (
											<NetworkRecordingEducationMessage />
										) : undefined
									}
								/>
							</DataCard>

							<DataCard title="Response Payload" fullWidth>
								<KeyValueTable
									data={responsePayloadData}
									noDataMessage={
										!networkRecordingEnabledForSession ? (
											<NetworkRecordingEducationMessage />
										) : undefined
									}
								/>
							</DataCard>
						</>
					)}
			</Space>
		</section>
	)
}

export default ResourceDetailsModal

const NetworkRecordingEducationMessage = () => (
	<div className={styles.noDataMessageContainer}>
		<p>
			<code>recordHeadersAndBody</code> is disabled. If you would like to
			see XHR/Fetch headers and bodies you will need to enable{' '}
			<code>recordHeadersAndBody</code>.
		</p>
		<p>
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
		</p>
	</div>
)
