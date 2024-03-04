import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { ApolloServerHighlightPlugin } from '@highlight-run/apollo'
import { CONSTANTS } from './constants'

const typeDefs = `#graphql
  type Book {
    title: String
    author: String
  }
  
  type Error {
    isError: Boolean
  }

  type Query {
    books: [Book]
    error: Error
  }
`

const books = [
	{
		title: 'The Awakening',
		author: 'Kate Chopin',
	},
	{
		title: 'City of Glass',
		author: 'Paul Auster',
	},
]

const resolvers = {
	Query: {
		books: () => books,
		error: () => {
			throw new Error('error')

			return { isError: true }
		},
	},
}

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
	typeDefs,
	resolvers,
	plugins: [
		ApolloServerHighlightPlugin({
			projectID: CONSTANTS.HIGHLIGHT_PROJECT_ID ?? '1',
			serviceName: 'apollo-test-server-plugin',
		}),
	],
})

export async function startApollo() {
	return new Promise<() => void>(async (resolve) => {
		const { url } = await startStandaloneServer(server, {
			listen: { port: 3004 },
		})

		console.log(`🚀  Server ready at: ${url}`)

		resolve(() => server.stop())
	})
}
