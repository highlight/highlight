export const ERRORS_TO_IGNORE = [
	'["\\"Script error.\\""]' /** This is an error that happens from a script that is on a different origin than the origin that Highlight is running on. See: https://sentry.io/answers/script-error/*/,
	'[{"isTrusted":true}]' /** Cross-origin errors: https://stackoverflow.com/questions/44815172/log-shows-error-object-istrustedtrue-instead-of-actual-error-data */,
	'["{}"]',
	'[""]',
	'["\\"\\""]',
]

export const ERROR_PATTERNS_TO_IGNORE = [
	'websocket error',
	'\\"ResizeObserver loop',
]
