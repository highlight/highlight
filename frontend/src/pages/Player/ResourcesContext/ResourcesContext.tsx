import { Session, SortDirection, TraceEdge } from '@graph/schemas'
import { RequestResponsePair } from 'highlight.run'
import { RequestType } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { getGraphQLResolverName } from '@pages/Player/utils/utils'
import { createContext } from '@util/context/context'
import { useEffect, useState } from 'react'

import { ApolloError } from '@apollo/client'
import { useGetTraces } from '@pages/Traces/useGetTraces'
import { useProjectId } from '@hooks/useProjectId'
import moment from 'moment'

export enum LoadingError {
	NetworkResourcesFetchFailed = 'failed to fetch.',
}

interface ResourcesContext {
	resourcesLoading: boolean
	loadingAfter: boolean
	fetchMoreForward: () => Promise<void>
	resources: NetworkResourceWithID[]
	error?: LoadingError | ApolloError
}

interface NetworkResource extends PerformanceResourceTiming {
	startTimeAbs: number
	responseEndAbs: number
	// http specific
	requestResponsePairs?: RequestResponsePair
	displayName?: string
	// websocket specific
	socketId?: string
	type?: 'open' | 'close'
}

export type NetworkResourceWithID = { id: number } & NetworkResource

const buildResources = (traces: TraceEdge[]) => {
	const indexResources = [] as NetworkResourceWithID[]
	const webSocketHash = {} as { [key: string]: NetworkResource }

	traces?.forEach((trace: TraceEdge) => {
		const start = moment(trace.node.timestamp)
		const transferSize = Number(
			trace.node.traceAttributes.http?.response?.encoded?.size ??
				trace.node.traceAttributes.http?.response?.transfer?.size ??
				trace.node.traceAttributes.http?.response_content_length,
		)
		const requestBody =
			trace.node.traceAttributes.http?.request?.body === 'undefined'
				? undefined
				: trace.node.traceAttributes.http?.request?.body
		const responseBody =
			trace.node.traceAttributes.http?.response?.body === 'undefined'
				? undefined
				: trace.node.traceAttributes.http?.response?.body
		let requestHeaders =
				trace.node.traceAttributes.http?.request?.headers ??
				trace.node.traceAttributes.http?.request?.header,
			responseHeaders =
				trace.node.traceAttributes.http?.response?.headers ??
				trace.node.traceAttributes.http?.response?.header
		try {
			if (typeof requestHeaders === 'string') {
				requestHeaders = JSON.parse(requestHeaders)
			}
		} catch (e) {}
		try {
			if (typeof responseHeaders === 'string') {
				responseHeaders = JSON.parse(responseHeaders)
			}
		} catch (e) {}
		const resource = {
			startTimeAbs: start.toDate().getTime(),
			responseEndAbs:
				start.toDate().getTime() + trace.node.duration / 1e6,
			decodedBodySize: Number(
				trace.node.traceAttributes.http?.response_content_length,
			),
			name: trace.node.traceAttributes.http?.url,
			initiatorType:
				trace.node.traceAttributes.initiator_type ||
				(requestBody || responseBody ? 'fetch' : 'other'),
			transferSize,
			requestResponsePairs: {
				request: {
					id: trace.node.traceID,
					body: requestBody,
					headers: requestHeaders,
					sessionSecureID: trace.node.secureSessionID,
					url: trace.node.traceAttributes.http?.url,
					verb: trace.node.traceAttributes.http?.method,
				},
				response: {
					body: responseBody,
					headers: responseHeaders,
					status:
						trace.node.traceAttributes.http?.status_code === '0'
							? 'Unknown'
							: trace.node.traceAttributes.http?.status_code,
					size: transferSize,
				},
				urlBlocked: trace.node.traceAttributes.http?.blocked,
			},
			socketId: trace.node.traceID,
			type:
				trace.node.traceAttributes.ws?.type ||
				trace.node.traceAttributes.http?.type,
		} as unknown as NetworkResource
		if (
			resource.initiatorType === RequestType.WebSocket &&
			resource.socketId
		) {
			webSocketHash[resource.socketId] = {
				...webSocketHash?.[resource.socketId],
				...resource,
			}

			if (resource.type === 'close') {
				return
			}
		}

		{
			indexResources.push({
				...resource,
				id: indexResources.length,
			})
		}
	})

	return indexResources
		.sort((a, b) => {
			if (!!a.startTimeAbs && !!b.startTimeAbs) {
				return a.startTimeAbs - b.startTimeAbs
			} else {
				// used in highlight.run <8.8.0 for websocket events and <7.5.4 for requests
				return a.startTime - b.startTime
			}
		})
		.map((resource: NetworkResourceWithID) => {
			const resolverName = getGraphQLResolverName(resource)

			let updatedResource = { ...resource }

			if (resolverName) {
				updatedResource.displayName = `${resolverName} (${resource.name})`
			}

			if (resource.startTimeAbs && resource.responseEndAbs) {
				updatedResource = {
					...updatedResource,
					duration: resource.responseEndAbs - resource.startTimeAbs,
				}
			} else if (resource.responseEnd && resource.startTime) {
				// used in highlight.run <8.8.0 for websocket events and <7.5.4 for requests
				updatedResource = {
					...updatedResource,
					duration: resource.responseEnd - resource.startTime,
				}
			}

			return updatedResource
		})
}

export const useResources = (
	session: Session | undefined,
): {
	error: ApolloError | undefined
	fetchMoreForward: () => Promise<void>
	loadingAfter: boolean
	resources: NetworkResourceWithID[]
	resourcesLoading: boolean
} => {
	const { projectId } = useProjectId()

	const {
		traceEdges,
		loading: resourcesLoading,
		error: dataError,
		loadingAfter,
		fetchMoreForward,
	} = useGetTraces({
		query: `secure_session_id=${session?.secure_id} AND highlight_type=http.request`,
		projectId,
		startDate: moment(session?.created_at).toDate(),
		endDate: moment(session?.created_at).add(4, 'hours').toDate(),
		traceCursor: undefined,
		sortDirection: SortDirection.Asc,
		sortColumn: 'timestamp',
		skip: !session?.secure_id,
		skipPolling: true,
		limit: 1_000,
	})

	const [resources, setResources] = useState<NetworkResourceWithID[]>([])

	useEffect(() => {
		if (session && traceEdges.length) {
			setResources(buildResources(traceEdges))
		}
	}, [session, traceEdges])

	return {
		resources,
		resourcesLoading,
		error: dataError,
		loadingAfter,
		fetchMoreForward,
	}
}

export const [useResourcesContext, ResourcesContextProvider] =
	createContext<ResourcesContext>('Resources')
