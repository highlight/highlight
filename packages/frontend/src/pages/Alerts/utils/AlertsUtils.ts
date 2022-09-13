export interface EnvironmentSuggestion {
	name: string
	value: string
}

export const dedupeEnvironments = (
	environmentsFromApi: EnvironmentSuggestion[],
) => {
	const allEnvironments = new Set([
		...environmentsFromApi.map(({ value }) => value),
		...DEFAULT_HIGHLIGHT_ENVIRONMENTS,
	])

	return Array.from(allEnvironments)
}

/**
 * Names for the environments a Highlight session was recorded in.
 */
export const DEFAULT_HIGHLIGHT_ENVIRONMENTS = [
	'production',
	'staging',
	'development',
]

export const getAlertTypeColor = (type: string) => {
	switch (type) {
		case 'Errors':
			return '#eb5757'
		case 'Feedback':
			return '#6fcf97'
		case 'Track Events':
			return '#56ccf2'
		case 'User Properties':
			return '#ffb038'
		case 'New Users':
			return '#937ccc'
		case 'New Sessions':
			return '#f95d6a'
		case 'Rage Clicks':
			return 'var(--color-red-400)'
		case 'Metric Monitor':
			return 'var(--color-orange-500)'
		default:
			return '#bdbdbd'
	}
}
