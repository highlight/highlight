export const flags = {
	'enable-session-card-text': {
		type: 'boolean',
		defaultValue: false,
	},
} as const

export type Flag = keyof typeof flags
