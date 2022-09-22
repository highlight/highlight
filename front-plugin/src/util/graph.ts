import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'

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

export const client = new ApolloClient({
	link: highlightGraph,
	cache: new InMemoryCache(),
	assumeImmutableResults: true,
	connectToDevTools: process.env.REACT_APP_ENVIRONMENT === 'dev',
})
