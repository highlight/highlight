import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	initializeNodeSDK,
	jsGetSnippet,
	manualError,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSApolloContent: QuickStartContent = {
	title: 'Apollo',
	subtitle: 'Learn how to set up highlight.io on your Apollo Server backend.',
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
		setupLogging('apollo'),
	],
}
