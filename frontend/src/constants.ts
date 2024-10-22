export const PRIVATE_GRAPH_URI =
	import.meta.env.REACT_APP_PRIVATE_GRAPH_URI ??
	window.location.origin + '/private'
export const PUBLIC_GRAPH_URI =
	import.meta.env.REACT_APP_PUBLIC_GRAPH_URI || 'https://pub.highlight.io'
export const FRONTEND_URI =
	import.meta.env.REACT_APP_FRONTEND_URI ||
	window.location.protocol + '//' + window.location.host
export const AUTH_MODE =
	import.meta.env.REACT_APP_AUTH_MODE.toString().toLowerCase() as
		| 'simple'
		| 'password'
		| 'oauth'
		| 'firebase'
export const OTLP_ENDPOINT =
	import.meta.env.REACT_APP_OTLP_ENDPOINT || 'https://otel.highlight.io:4318'
export const DISABLE_ANALYTICS = import.meta.env.REACT_APP_DISABLE_ANALYTICS
