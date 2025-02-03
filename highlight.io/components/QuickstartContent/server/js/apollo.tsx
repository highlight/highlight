import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	initializeNodeSDK,
	jsGetSnippet,
	manualError,
	verifyError,
} from './shared-snippets-monitoring'

export const JSApolloReorganizedContent: QuickStartContent = {
	title: 'Apollo',
	subtitle: 'Learn how to set up highlight.io on your Apollo Server backend.',
	logoKey: 'apollo',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node', 'apollo']),
		initializeNodeSDK('node'),
		{
			title: `Add the Apollo Server integration.`,
			content:
				'`ApolloServerHighlightPlugin` is an [Apollo Server](https://www.apollographql.com/docs/apollo-server/) plugin to capture errors in your graphql handlers.',
			code: [
				{
					text: `import { ApolloServer } from '@apollo/server'
import { ApolloServerHighlightPlugin } from '@highlight-run/apollo'
// on legacy Apollo V3, use the following import 
// import { ApolloServerV3HighlightPlugin as ApolloServerHighlightPlugin } from '@highlight-run/apollo'

// ...

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
		ApolloServerHighlightPlugin({ projectID: '<YOUR_PROJECT_ID>', serviceName: 'my-apollo-app', serviceVersion: 'git-sha', environment: 'production' }),
	],
})`,
					language: `js`,
				},
			],
		},
		manualError,
		verifyError(
			'apollo',
			`const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      books: () => {
        throw new Error('a sample error!');
      },
    },
  },
});`,
		),
		verifyLogs,
		verifyTraces,
	],
}
