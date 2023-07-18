export const PRIVATE_GRAPH_URI =
	import.meta.env.REACT_APP_PRIVATE_GRAPH_URI ??
	window.location.origin + '/private'
export const PUBLIC_GRAPH_URI =
	import.meta.env.REACT_APP_PUBLIC_GRAPH_URI || 'https://pub.highlight.io'
export const FRONTEND_URI =
	import.meta.env.REACT_APP_FRONTEND_URI ||
	window.location.protocol + '//' + window.location.host
