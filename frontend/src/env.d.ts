/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly REACT_APP_AUTH_MODE: string
	readonly REACT_APP_COMMIT_SHA: string
	readonly REACT_APP_FIREBASE_CONFIG_OBJECT: string
	readonly REACT_APP_FRONTEND_ORG: string
	readonly REACT_APP_FRONTEND_URI: string
	readonly REACT_APP_IN_DOCKER: string
	readonly REACT_APP_PRIVATE_GRAPH_URI: string
	readonly REACT_APP_PUBLIC_GRAPH_URI: string
	readonly REACT_APP_STRIPE_API_PK: string
	readonly REACT_APP_VERCEL_INTEGRATION_NAME: string
	readonly REACT_APP_OTLP_ENDPOINT: string
	readonly REACT_APP_DISABLE_ANALYTICS: string

	readonly CLICKUP_CLIENT_ID: string
	readonly DEMO_PROJECT_ID: string
	readonly DISCORD_CLIENT_ID: string
	readonly GITHUB_CLIENT_ID: string
	readonly GITLAB_CLIENT_ID: string
	readonly HEIGHT_CLIENT_ID: string
	readonly JIRA_CLIENT_ID: string
	readonly LINEAR_CLIENT_ID: string
	readonly MICROSOFT_TEAMS_BOT_ID: string
	readonly SLACK_CLIENT_ID: string

	readonly SSL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
