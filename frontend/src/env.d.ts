/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly REACT_APP_AUTH_MODE: string
	readonly REACT_APP_COMMIT_SHA: string
	readonly REACT_APP_FIREBASE_CONFIG_OBJECT: string
	readonly REACT_APP_FRONT_INTEGRATION_CLIENT_ID: string
	readonly REACT_APP_FRONTEND_ORG: string
	readonly REACT_APP_FRONTEND_URI: string
	readonly REACT_APP_PRIVATE_GRAPH_URI: string
	readonly REACT_APP_PUBLIC_GRAPH_URI: string
	readonly REACT_APP_STRIPE_API_PK: string
	readonly REACT_APP_VERCEL_INTEGRATION_NAME: string

	readonly DISCORD_CLIENT_ID: string
	readonly LINEAR_CLIENT_ID: string
	readonly SLACK_CLIENT_ID: string
	readonly DD_CLIENT_TOKEN: string
	readonly DEMO_SESSION_URL: string
	readonly DEMO_ERROR_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
