/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly REACT_APP_FRONT_INTEGRATION_CLIENT_ID: string
	readonly LINEAR_CLIENT_ID: string
	readonly SLACK_CLIENT_ID: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
