export const flags: Record<
	string,
	{
		type: 'boolean' | 'multivariate'
		defaultValue: string | boolean
	}
> = {
	'enable-session-card-text': {
		type: 'boolean',
		defaultValue: false,
	},
	'enable-session-card-style': {
		type: 'multivariate',
		defaultValue: 'normal',
	},
	'rename-setup': {
		type: 'multivariate',
		defaultValue: 'connect',
	},
	'session-results-verbose': {
		type: 'boolean',
		defaultValue: false,
	},
	'enable-users-analytics-view': {
		type: 'boolean',
		defaultValue: false,
	},
} as const

export type Flag = keyof typeof flags
