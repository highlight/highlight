import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getOAuthToken } from '../providers/highlightContext'

const uri =
	window.location.host.indexOf('300') === -1
		? 'https://pri.highlight.run'
		: 'https://localhost:8082/private'
const highlightGraph = createHttpLink({
	uri,
	credentials: 'include',
})

const authLink = setContext((_, { headers }) => {
	const oauth = getOAuthToken()
	if (oauth?.access_token)
		return {
			headers: {
				...headers,
				Authorization: `Bearer ${oauth?.access_token}`,
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
