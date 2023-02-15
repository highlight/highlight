import 'firebase/auth'

import {
	ApolloClient,
	ApolloLink,
	createHttpLink,
	HttpLink,
	InMemoryCache,
	split,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { namedOperations } from '@graph/operations'
import { auth } from '@util/auth'
import { IndexedDBLink } from '@util/db'
import { isOnPrem } from '@util/onPrem/onPremUtils'

const uri =
	import.meta.env.REACT_APP_PRIVATE_GRAPH_URI ??
	window.location.origin + '/private'
const highlightGraph = new IndexedDBLink(
	createHttpLink({
		uri,
		credentials: 'include',
	}),
)
let splitLink = null
try {
	const socketUri = uri
		.replace('http://', 'ws://')
		.replace('https://', 'wss://')
	const highlightSocket = new WebSocketLink({
		uri: socketUri,
		options: {
			lazy: true,
			reconnect: true,
			connectionParams: async () => {
				const token = await auth.currentUser?.getIdToken()
				return {
					token,
				}
			},
		},
	})
	splitLink = split(
		({ query }) => {
			const definition = getMainDefinition(query)
			return (
				definition.kind === 'OperationDefinition' &&
				definition.operation === 'subscription'
			)
		},
		highlightSocket,
		highlightGraph,
	)
} catch (error) {
	console.log('Error setting up websocket: ', error)
}

const graphCdnGraph = new HttpLink({
	uri: 'https://graphcdn.highlight.run',
})
if (isOnPrem) {
	console.log('Private Graph URI: ', uri)
}

const authLink = setContext((_, { headers }) => {
	// get the authentication token from local storage if it exists
	const user = auth.currentUser
	// return the headers to the context so httpLink can read them
	return user?.getIdToken().then((t) => {
		return { headers: { ...headers, token: t } }
	})
})

const { Query } = namedOperations
/**
 * These are the queries that should be routed to GraphCDN instead of private graph.
 * We use GraphCDN for expensive queries.
 * */
const GraphCDNOperations = [
	Query.GetKeyPerformanceIndicators,
	Query.GetDailyErrorFrequency,
	Query.GetDailySessionsCount,
	Query.GetReferrersCount,
	Query.GetTopUsers,
	Query.GetRageClicksForProject,
] as const

const cache = new InMemoryCache({
	typePolicies: {
		Session: {
			keyFields: ['secure_id'],
		},
		ErrorGroup: {
			keyFields: ['secure_id'],
		},
		DashboardPayload: {
			fields: {
				metrics_histogram: {
					keyArgs: ['project_id', 'metric_name', 'params'],
				},
			},
		},
		HistogramPayload: {
			fields: {
				metrics_histogram: {
					keyArgs: ['project_id', 'metric_name', 'params'],
				},
			},
		},
	},
})

export const client = new ApolloClient({
	link: ApolloLink.split(
		(operation) => {
			// Don't query GraphCDN for localhost.
			// GraphCDN only caches production data.
			if (import.meta.env.NODE_ENV === 'development') {
				return false
			}

			// Check to see if the operation is one that we should send to GraphCDN instead of private graph.
			// @ts-expect-error
			return GraphCDNOperations.includes(operation.operationName)
		},
		authLink.concat(graphCdnGraph),
		authLink.concat(splitLink || highlightGraph),
	),
	cache,
	assumeImmutableResults: true,
	connectToDevTools: import.meta.env.DEV,
})
