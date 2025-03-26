export const flags: Record<
	string,
	{
		type: 'boolean' | 'multivariate'
		defaultValue: string | boolean
		variants?: Record<string, string>
	}
> = {
	'enable-session-card-text': {
		type: 'boolean',
		defaultValue: false,
	},
	'enable-session-card-style': {
		type: 'multivariate',
		defaultValue: 'default',
		variants: {
			default: 'default',
			good: 'good',
			bad: 'bad',
		},
	},
	'rename-setup': {
		type: 'multivariate',
		defaultValue: 'connect',
		variants: {
			connect: 'connect',
			setup: 'setup',
			onboarding: 'onboarding',
		},
	},
	'session-results-verbose': {
		type: 'boolean',
		defaultValue: false,
	},
} as const

export type Flag = keyof typeof flags
