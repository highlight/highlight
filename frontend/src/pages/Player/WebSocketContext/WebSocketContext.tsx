import { useGetWebSocketEventsQuery } from '@graph/hooks'
import { Session, WebSocketEvent } from '@graph/schemas'
import { LoadingError } from '@pages/Player/ResourcesContext/ResourcesContext'
import { indexedDBFetch } from '@util/db'
import { checkResourceLimit } from '@util/preload'
import { H } from 'highlight.run'
import { useEffect, useState } from 'react'

interface webSocketContext {
	webSocketLoading: boolean
	webSocketEvents: any[]
	error?: LoadingError
}

export const useWebSocket = (
	session: Pick<Session, 'web_socket_events_url' | 'secure_id'> | undefined,
): webSocketContext => {
	const [error, setError] = useState<LoadingError>()

	const [loading, setLoading] = useState(false)
	const skipQuery = !session?.secure_id || !!session?.web_socket_events_url

	const { data, loading: queryLoading } = useGetWebSocketEventsQuery({
		variables: {
			session_secure_id: session?.secure_id ?? '',
		},
		fetchPolicy: 'no-cache',
		skip: skipQuery,
	})

	useEffect(() => {
		if (!skipQuery) {
			setLoading(queryLoading)
		}
	}, [queryLoading, skipQuery])

	const [webSocketEvents, setWebSocketEvents] = useState<
		Pick<
			WebSocketEvent,
			'message' | 'name' | 'size' | 'socketId' | 'timeStamp' | 'type'
		>[]
	>([])
	useEffect(() => {
		if (!session?.secure_id || !data?.websocket_events) return
		setError(undefined)
		setWebSocketEvents(
			data.websocket_events.map((e) => ({
				...e,
				session_secure_id: session.secure_id,
			})) ?? [],
		)
	}, [data?.websocket_events, session?.secure_id])

	useEffect(() => {
		if (!!session?.web_socket_events_url) {
			setLoading(true)
			;(async () => {
				if (!session.web_socket_events_url) return
				const limit = await checkResourceLimit(
					session.web_socket_events_url,
				)
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
				for await (const r of indexedDBFetch(
					session.web_socket_events_url,
				)) {
					response = r
				}
				if (response) {
					response
						.json()
						.then((data) => {
							setError(undefined)
							setWebSocketEvents(
								(data as any[] | undefined)?.map(
									// convert the s3 file schema to what frontend expects
									(r) =>
										({
											...r,
										}) as Pick<
											WebSocketEvent,
											| 'message'
											| 'name'
											| 'size'
											| 'socketId'
											| 'timeStamp'
											| 'type'
										>,
								) ?? [],
							)
						})
						.catch((e) => {
							setError(LoadingError.NetworkResourcesFetchFailed)
							setWebSocketEvents([])
							H.consumeError(
								e,
								'Error direct downloading resources',
							)
						})
						.finally(() => setLoading(false))
				}
			})()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session?.secure_id])

	return {
		webSocketEvents,
		webSocketLoading: loading,
		error,
	}
}
