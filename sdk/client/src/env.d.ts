/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly REACT_APP_PUBLIC_GRAPH_URI: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
