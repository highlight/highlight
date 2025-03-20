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
} as const

export type Flag = keyof typeof flags
