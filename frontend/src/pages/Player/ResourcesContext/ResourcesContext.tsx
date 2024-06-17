import { useGetResourcesQuery } from '@graph/hooks'
import { Session } from '@graph/schemas'
import { RequestResponsePair } from '@highlight-run/client'
import { RequestType } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { getGraphQLResolverName } from '@pages/Player/utils/utils'
import { createContext } from '@util/context/context'
import { indexedDBFetch } from '@util/db'
import { checkResourceLimit } from '@util/preload'
import { H } from 'highlight.run'
import { useCallback, useEffect, useState } from 'react'
import { BooleanParam, useQueryParam } from 'use-query-params'

import { useSessionParams } from '@/pages/Sessions/utils'

export enum LoadingError {
	NetworkResourcesTooLarge = 'payload too large.',
	NetworkResourcesFetchFailed = 'failed to fetch.',
}

interface ResourcesContext {
	resourcesLoading: boolean
	loadResources: () => void
	resources: NetworkResourceWithID[]
	error?: LoadingError
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

const buildResources = (resources: NetworkResource[]) => {
	const indexResources = [] as NetworkResourceWithID[]
	const webSocketHash = {} as { [key: string]: NetworkResource }

	resources?.forEach((resource: NetworkResource) => {
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

			const updatedResource = { ...resource }

			if (resolverName) {
				updatedResource.displayName = `${resolverName} (${resource.name})`
			}

			if (resource.startTimeAbs && resource.responseEndAbs) {
				updatedResource.duration =
					resource.responseEndAbs - resource.startTimeAbs
			} else if (resource.responseEnd && resource.startTime) {
				// used in highlight.run <8.8.0 for websocket events and <7.5.4 for requests
				updatedResource.duration =
					resource.responseEnd - resource.startTime
			}

			return updatedResource
		})
}

export const useResources = (
	session: Session | undefined,
): ResourcesContext => {
	const { sessionSecureId: session_secure_id } = useSessionParams()
	const [sessionSecureId, setSessionSecureId] = useState<string>()
	const [error, setError] = useState<LoadingError>()
	const [downloadResources] = useQueryParam('downloadresources', BooleanParam)

	const [resourcesLoading, setResourcesLoading] = useState(false)
	const skipQuery =
		sessionSecureId === undefined ||
		session === undefined ||
		!!session?.resources_url

	const { data, loading: queryLoading } = useGetResourcesQuery({
		variables: {
			session_secure_id: sessionSecureId ?? '',
		},
		fetchPolicy: 'cache-and-network',
		skip: skipQuery,
	})

	useEffect(() => {
		if (!skipQuery) {
			setResourcesLoading(queryLoading && data === undefined)
		}
	}, [data, queryLoading, skipQuery])

	const [resources, setResources] = useState<NetworkResourceWithID[]>([])
	useEffect(() => {
		setError(undefined)
		setResources(buildResources(data?.resources as NetworkResource[]))
	}, [data?.resources])

	useEffect(() => {
		if (downloadResources && resources.length > 0) {
			const a = document.createElement('a')
			const file = new Blob([JSON.stringify(resources)], {
				type: 'application/json',
			})

			a.href = URL.createObjectURL(file)
			a.download = `session-${sessionSecureId}-resources.json`
			a.click()

			URL.revokeObjectURL(a.href)
		}
	}, [downloadResources, resources, sessionSecureId])

	// If sessionSecureId is set and equals the current session's (ensures effect is run once)
	// and resources url is defined, fetch using resources url
	useEffect(() => {
		if (
			sessionSecureId === session?.secure_id &&
			!!session?.resources_url
		) {
			setResourcesLoading(true)
			;(async () => {
				if (!session.resources_url) return
				const limit = await checkResourceLimit(session.resources_url)
				if (limit) {
					setError(LoadingError.NetworkResourcesTooLarge)
					H.consumeError(new Error(limit.error), undefined, {
						fileSize: limit.fileSize.toString(),
						limit: limit.sizeLimit.toString(),
						sessionSecureID: session?.secure_id,
					})
					return
				}
				let response
				for await (const r of indexedDBFetch(session.resources_url)) {
					response = r
				}
				if (response) {
					response
						.json()
						.then((data) => {
							setError(undefined)
							setResources(buildResources(data))
						})
						.catch((e) => {
							setError(LoadingError.NetworkResourcesFetchFailed)
							setResources([])
							H.consumeError(
								e,
								'Error direct downloading resources',
							)
						})
						.finally(() => setResourcesLoading(false))
				}
			})()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionSecureId, session?.secure_id])

	const loadResources = useCallback(() => {
		setSessionSecureId(session_secure_id)
	}, [session_secure_id])

	return {
		loadResources,
		resources,
		resourcesLoading,
		error,
	}
}

export const [useResourcesContext, ResourcesContextProvider] =
	createContext<ResourcesContext>('Resources')
