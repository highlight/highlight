import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { gql } from 'apollo-server'
import {
	getOtlpEndpoint,
	getResourceSpans,
	startMockOtelServer,
} from 'mock-otel-server'
import { ApolloServerHighlightPlugin } from './apollo'

const SESSION_ID = '123456'
const TRACE_ID = '78910'
const HIGHLIGHT_HEADER = { 'x-highlight-request': `${SESSION_ID}/${TRACE_ID}` }

describe('ApolloServerHighlightPlugin', () => {
	const port = 5552
	let stop: () => void
	let url: string

	beforeAll(async () => {
		const stopOtel = startMockOtelServer({ port })

		const { stopApollo, apolloUrl } = await startApollo(
			getOtlpEndpoint(port),
		)

		stop = () => {
			stopApollo()
			stopOtel()
		}
		url = apolloUrl
	})

	afterAll(() => stop())

	it('should add the plugin to the Apollo Server', async () => {
		const response = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				operationName: 'helloWorld',
				query: 'query helloWorld {\n  hello \n}\n',
				variables: {},
			}),
			headers: {
				'Content-Type': 'application/json',
				...HIGHLIGHT_HEADER,
			},
		})
		await response.json()

		const { details } = await getResourceSpans(port)

		const highlightRunWithHeadersSpan = details.find(({ spanNames }) =>
			spanNames.includes('highlight-ctx'),
		)
		const sessionId =
			highlightRunWithHeadersSpan?.attributes['highlight.session_id']
		const traceId =
			highlightRunWithHeadersSpan?.attributes['highlight.trace_id']

		expect(sessionId).toEqual(SESSION_ID)
		expect(traceId).toEqual(TRACE_ID)
	})
})

async function startApollo(otlpEndpoint: string) {
	const typeDefs = gql`
		type Query {
			hello: String
		}
	`

	const resolvers = {
		Query: {
			hello: () => 'Hello, world!',
		},
	}

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [
			ApolloServerHighlightPlugin({
				projectID: '1',
				otlpEndpoint,
			}),
		],
	})

	const { url } = await startStandaloneServer(server, {
		listen: { port: 3004 },
	})

	return { stopApollo: () => server.stop(), apolloUrl: url }
}
