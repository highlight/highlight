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
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { persistCache } from 'apollo3-cache-persist'
import Firebase from 'firebase/app'

const uri =
	import.meta.env.REACT_APP_PRIVATE_GRAPH_URI ??
	window.location.origin + '/private'
const highlightGraph = createHttpLink({
	uri,
	credentials: 'include',
})
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
				const token = await Firebase.auth().currentUser?.getIdToken()
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
	const user = Firebase.auth().currentUser
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

// graphql queries that should be stored in sessionStorage
const STORED_QUERIES = ['metrics_histogram', 'metrics_timeline'] as const
persistCache({
	cache,
	storage: sessionStorage,
	key: 'highlight-apollo-cache',
	persistenceMapper: async (data: string) => {
		const d: { ROOT_QUERY?: { [key: string]: any } } = JSON.parse(data)
		const saved: { ROOT_QUERY: { [key: string]: any } } = {
			ROOT_QUERY: {},
		}
		for (const k in d.ROOT_QUERY) {
			for (const storedKey of STORED_QUERIES) {
				if (k.startsWith(storedKey)) {
					saved.ROOT_QUERY[k] = d.ROOT_QUERY[k]
					break
				}
			}
		}
		return JSON.stringify(saved)
	},
}).catch(console.error)

export const client = new ApolloClient({
	link: ApolloLink.split(
		(operation) => {
			// Don't query GraphCDN for localhost.
			// GraphCDN only caches production data.
			if (import.meta.env.MODE === 'development') {
				return false
			}

			// Check to see if the operation is one that we should send to GraphCDN instead of private graph.
			// @ts-expect-error
			return GraphCDNOperations.includes(operation.operationName)
		},
		authLink.concat(graphCdnGraph),
		authLink.concat(splitLink || highlightGraph),
	),
	cache: cache,
	assumeImmutableResults: true,
	connectToDevTools: import.meta.env.REACT_APP_ENVIRONMENT === 'dev',
})
