import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { FrontContextProvider } from './providers/frontContext'
import { H } from 'highlight.run'
import { ErrorBoundary } from '@highlight-run/react'
import { HighlightContextProvider } from './providers/highlightContext'
import { client } from './util/graph'
import { ApolloProvider } from '@apollo/client'

H.init('ldw76kgo', {
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
		destinationDomains: ['front.highlight.io'],
	},
	tracingOrigins: ['highlight.run', 'localhost'],
})

ReactDOM.render(
	<React.StrictMode>
		<ApolloProvider client={client}>
			<HighlightContextProvider>
				<FrontContextProvider>
					<ErrorBoundary showDialog>
						<App />
					</ErrorBoundary>
				</FrontContextProvider>
			</HighlightContextProvider>
		</ApolloProvider>
	</React.StrictMode>,
	document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
