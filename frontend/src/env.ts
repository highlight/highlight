export const REACT_APP_FIREBASE_CONFIG_OBJECT = import.meta.env.REFLAME
	? JSON.stringify({
			apiKey: 'AIzaSyD7g86A3EzEKmoE7aZ04Re3HZ0B4bWlL68',
			authDomain: 'auth.highlight.run',
			databaseURL: 'https://highlight-f5c5b.firebaseio.com',
			projectId: 'highlight-f5c5b',
			storageBucket: 'highlight-f5c5b.appspot.com',
			messagingSenderId: '263184175068',
			appId: '1:263184175068:web:f8190c20320087d1c6c919',
	  })
	: import.meta.env.REACT_APP_FIREBASE_CONFIG_OBJECT
export const REACT_APP_COMMIT_SHA = import.meta.env.REFLAME
	? window.Reflame.gitCommitSha
	: import.meta.env.REACT_APP_COMMIT_SHA
export const REACT_APP_PRIVATE_GRAPH_URI = import.meta.env.REFLAME
	? 'https://pri.highlight.run'
	: import.meta.env.REACT_APP_PRIVATE_GRAPH_URI
export const REACT_APP_ONPREM = import.meta.env.REFLAME
	? false
	: import.meta.env.REACT_APP_ONPREM
export const REACT_APP_FRONTEND_URI = import.meta.env.REFLAME
	? window.location.origin
	: import.meta.env.REACT_APP_FRONTEND_URI
export const REACT_APP_FRONTEND_ORG = import.meta.env.REFLAME
	? 1
	: import.meta.env.REACT_APP_FRONTEND_ORG
export const REACT_APP_PUBLIC_GRAPH_URI = import.meta.env.REFLAME
	? 'https://pub.highlight.run'
	: import.meta.env.REACT_APP_PUBLIC_GRAPH_URI

// TODO: everything below still need appropriate values provided
export const REACT_APP_AUTH_MODE = import.meta.env.REFLAME
	? undefined
	: import.meta.env.REACT_APP_AUTH_MODE
export const SLACK_CLIENT_ID = import.meta.env.REFLAME
	? undefined
	: import.meta.env.SLACK_CLIENT_ID
export const REACT_APP_STRIPE_API_PK = import.meta.env.REFLAME
	? undefined
	: import.meta.env.REACT_APP_STRIPE_API_PK
export const DEMO_ERROR_URL = import.meta.env.REFLAME
	? undefined
	: import.meta.env.DEMO_ERROR_URL
export const CLICKUP_CLIENT_ID = import.meta.env.REFLAME
	? undefined
	: import.meta.env.CLICKUP_CLIENT_ID
export const DISCORD_CLIENT_ID = import.meta.env.REFLAME
	? undefined
	: import.meta.env.DISCORD_CLIENT_ID
export const REACT_APP_FRONT_INTEGRATION_CLIENT_ID = import.meta.env.REFLAME
	? undefined
	: import.meta.env.REACT_APP_FRONT_INTEGRATION_CLIENT_ID
export const HEIGHT_CLIENT_ID = import.meta.env.REFLAME
	? undefined
	: import.meta.env.HEIGHT_CLIENT_ID
export const DEMO_SESSION_URL = import.meta.env.REFLAME
	? undefined
	: import.meta.env.DEMO_SESSION_URL
export const LINEAR_CLIENT_ID = import.meta.env.REFLAME
	? undefined
	: import.meta.env.LINEAR_CLIENT_ID
