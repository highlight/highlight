import { useGetResourcesQuery, useGetSessionQuery } from '@graph/hooks'
import { Session } from '@graph/schemas'
import { RequestResponsePair } from '@highlight-run/client'
import { getGraphQLResolverName } from '@pages/Player/utils/utils'
import { useParams } from '@util/react-router/useParams'
import { H } from 'highlight.run'
import { useCallback, useEffect, useState } from 'react'
import { BooleanParam, useQueryParam } from 'use-query-params'

import { createContext } from '../../../util/context/context'

interface ResourcesContext {
	resourcesLoading: boolean
	loadResources: () => void
	resources: NetworkResourceWithID[]
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
	const [downloadResources] = useQueryParam('downloadresources', BooleanParam)

	const { refetch: refetchSession } = useGetSessionQuery({
		fetchPolicy: 'no-cache',
		skip: true,
	})

	const [resourcesLoading, setResourcesLoading] = useState(true)
	const skipQuery =
		sessionSecureId === undefined ||
		session === undefined ||
		!!session?.resources_url

	const { data, loading: queryLoading } = useGetResourcesQuery({
		variables: {
			session_secure_id: sessionSecureId! ?? '',
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
			a.download = `session-${session_secure_id}-resources.json`
			a.click()

			URL.revokeObjectURL(a.href)
		}
	}, [downloadResources, resources, session_secure_id])

	// If sessionSecureId is set and equals the current session's (ensures effect is run once)
	// and resources url is defined, fetch using resources url
	useEffect(() => {
		if (
			sessionSecureId === session?.secure_id &&
			!!session?.resources_url
		) {
			setResourcesLoading(true)
			refetchSession({
				secure_id: sessionSecureId,
			})
				.then((result) => {
					const newUrl = result.data.session?.resources_url
					if (newUrl) {
						return fetch(newUrl)
					} else {
						throw new Error('resources_url not defined')
					}
				})
				.then((response) => response.json())
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
					H.consumeError(e, 'Error direct downloading resources')
				})
				.finally(() => setResourcesLoading(false))
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
	}
}

export const [useResourcesContext, ResourcesContextProvider] =
	createContext<ResourcesContext>('Resources')
