import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getOAuthToken } from '../providers/highlightContext'

export const HighlightPrivate =
	window.location.host.indexOf('local') === -1
		? 'https://pri.highlight.run'
		: 'https://pri.highlight.localhost'
export const HighlightPrivateGraph =
	window.location.host.indexOf('local') === -1
		? HighlightPrivate
		: `${HighlightPrivate}/private`
const highlightGraph = createHttpLink({
	uri: HighlightPrivateGraph,
	credentials: 'include',
})

const authLink = setContext((_, { headers }) => {
	const oauth = getOAuthToken()
	if (oauth?.AccessToken)
		return {
			headers: {
				...headers,
				Authorization: `Bearer ${oauth?.AccessToken}`,
			},
		}
	return headers
})

export const client = new ApolloClient({
	link: authLink.concat(highlightGraph),
	cache: new InMemoryCache(),
	assumeImmutableResults: true,
	connectToDevTools: process.env.REACT_APP_ENVIRONMENT === 'dev',
})
