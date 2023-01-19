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
			const processUpdate = (p: Promise<IteratorResult<Response>>) =>
				p
					.then((response) => response.value.json())
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
			const req = indexedDBFetch(session.resources_url)
			processUpdate(req.next()).then(() => processUpdate(req.next()))
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
