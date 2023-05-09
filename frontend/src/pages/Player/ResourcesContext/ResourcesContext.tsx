import { useGetResourcesQuery } from '@graph/hooks'
import { Session } from '@graph/schemas'
import { RequestResponsePair } from '@highlight-run/client'
import { getGraphQLResolverName } from '@pages/Player/utils/utils'
import { createContext } from '@util/context/context'
import { indexedDBFetch } from '@util/db'
import { useParams } from '@util/react-router/useParams'
import { H } from 'highlight.run'
import { useCallback, useEffect, useState } from 'react'
import { BooleanParam, useQueryParam } from 'use-query-params'

// Max brotlied resource file allowed. Note that a brotli file with some binary data
// has a compression ratio of >5x, so unbrotlied this file will take up much more memory.
const RESOURCE_FILE_SIZE_LIMIT_MB = 16

export enum ResourceLoadingError {
	NetworkResourcesTooLarge = 'payload too large.',
}

interface ResourcesContext {
	resourcesLoading: boolean
	loadResources: () => void
	resources: NetworkResourceWithID[]
	error?: ResourceLoadingError
}

export type NetworkResourceWithID = PerformanceResourceTiming & {
	id: number
	requestResponsePairs?: RequestResponsePair
	displayName?: string
}

export const useResources = (
	session: Session | undefined,
): ResourcesContext => {
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const [sessionSecureId, setSessionSecureId] = useState<string>()
	const [error, setError] = useState<ResourceLoadingError>()
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
		fetchPolicy: 'no-cache',
		skip: skipQuery,
	})

	useEffect(() => {
		if (!skipQuery) {
			setResourcesLoading(queryLoading)
		}
	}, [queryLoading, skipQuery])

	const [resources, setResources] = useState<NetworkResourceWithID[]>([])
	useEffect(() => {
		setResources(
			(
				data?.resources?.map((r, i) => {
					return { ...r, id: i }
				}) ?? []
			)
				.sort((a, b) => a.startTime - b.startTime)
				.map((resource) => {
					const resolverName = getGraphQLResolverName(resource)

					if (resolverName) {
						return {
							...resource,
							displayName: `${resolverName} (${resource.name})`,
						}
					}
					return resource
				}),
		)
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
				let response
				const r = await fetch(session.resources_url, {
					method: 'HEAD',
				})
				const fileSizeMB =
					Number(r.headers.get('Content-Length')) / 1024 / 1024
				if (fileSizeMB > RESOURCE_FILE_SIZE_LIMIT_MB) {
					setError(ResourceLoadingError.NetworkResourcesTooLarge)
					H.consumeError(
						new Error(`network payload too large`),
						undefined,
						{
							fileSizeMB: fileSizeMB.toString(),
							sessionSecureID: session?.secure_id,
						},
					)
					return
				}
				for await (const r of indexedDBFetch(session.resources_url)) {
					response = r
				}
				if (response) {
					response
						.json()
						.then((data) => {
							setResources(
								(
									(data as any[] | undefined)?.map((r, i) => {
										return { ...r, id: i }
									}) ?? []
								)
									.sort((a, b) => a.startTime - b.startTime)
									.map((resource) => {
										const resolverName =
											getGraphQLResolverName(resource)

										if (resolverName) {
											return {
												...resource,
												displayName: `${resolverName} (${resource.name})`,
											}
										}
										return resource
									}),
							)
						})
						.catch((e) => {
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
